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

  constructor(private configService: ConfigService) {
    this.useS3 = this.configService.get('S3_ENABLED') === 'true';
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';

    if (this.useS3) {
      this.s3Client = new S3Client({
        region: this.configService.get('AWS_REGION') || 'us-east-1',
        credentials: {
          accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
        },
      });
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
    const bucket = this.configService.get('S3_BUCKET');
    const region = this.configService.get('AWS_REGION') || 'us-east-1';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client!.send(command);

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

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

    const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3001';
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
      const bucket = this.configService.get('S3_BUCKET');
      const key = url.split(`${bucket}.s3.`)[1]?.split('.amazonaws.com/')[1];
      if (key) {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        await this.s3Client.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: key }),
        );
      }
    } else {
      const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3001';
      const relativePath = url.replace(baseUrl, '');
      const filePath = path.join(this.uploadDir, relativePath.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
