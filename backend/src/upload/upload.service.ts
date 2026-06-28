import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

export interface UploadResult {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private useS3: boolean;
  private uploadDir: string;
  private s3Endpoint: string | null = null;
  private s3Bucket: string;

  constructor(private configService: ConfigService) {
    this.useS3 = this.configService.get('S3_ENABLED') === 'true';
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.s3Bucket = this.configService.get('S3_BUCKET') || 'actionlife';

    if (this.useS3) {
      this.s3Endpoint = this.configService.get('S3_ENDPOINT') || null;

      const s3Config: Record<string, unknown> = {
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
        },
      };

      if (this.s3Endpoint) {
        // Custom S3-compatible storage (Liara, MinIO, etc.)
        s3Config.endpoint = this.s3Endpoint;
        s3Config.region = 'us-east-1'; // required by SDK but ignored by most custom endpoints
        s3Config.forcePathStyle = false;
      } else {
        // AWS S3
        s3Config.region = this.configService.get('AWS_REGION') || 'us-east-1';
      }

      this.s3Client = new S3Client(s3Config as any);
    } else {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `${folder}/${filename}`;

    if (this.useS3 && this.s3Client) {
      return this.uploadToS3(file, key);
    } else {
      return this.uploadToLocal(file, key);
    }
  }

  private async uploadToS3(
    file: Express.Multer.File,
    key: string,
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client!.send(command);

    // Use custom public URL if configured (e.g., http://storage.actionlife.ir)
    const storagePublicUrl = this.configService.get('STORAGE_PUBLIC_URL');
    let url: string;
    if (storagePublicUrl) {
      url = `${storagePublicUrl.replace(/\/+$/, '')}/${key}`;
    } else if (this.s3Endpoint) {
      // Custom S3 endpoint (Liara, MinIO, etc.)
      const endpointHost = this.s3Endpoint.replace(/^https?:\/\//, '');
      url = `https://${this.s3Bucket}.${endpointHost}/${key}`;
    } else {
      // AWS S3 standard
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      url = `https://${this.s3Bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return {
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    key: string,
  ): Promise<UploadResult> {
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filePath, file.buffer);

    const baseUrl =
      this.configService.get('BASE_URL') || 'http://localhost:3001';
    const url = `${baseUrl}/uploads/${key}`;

    return {
      url,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(url: string): Promise<void> {
    if (this.useS3 && this.s3Client) {
      let key: string | undefined;

      if (this.s3Endpoint) {
        // Custom S3 endpoint URL: https://{bucket}.{endpoint-host}/{key}
        const endpointHost = this.s3Endpoint.replace(/^https?:\/\//, '');
        key = url.split(`${this.s3Bucket}.${endpointHost}/`)[1];
      } else {
        // AWS S3 URL: https://{bucket}.s3.{region}.amazonaws.com/{key}
        key = url.split(`${this.s3Bucket}.s3.`)[1]?.split('.amazonaws.com/')[1];
      }

      if (key) {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        await this.s3Client.send(
          new DeleteObjectCommand({ Bucket: this.s3Bucket, Key: key }),
        );
      }
    } else {
      const baseUrl =
        this.configService.get('BASE_URL') || 'http://localhost:3001';
      const relativePath = url.replace(baseUrl, '');
      const filePath = path.join(
        this.uploadDir,
        relativePath.replace('/uploads/', ''),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
