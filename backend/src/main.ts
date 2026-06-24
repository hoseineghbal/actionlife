import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { runSeed } from './seed';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users/schemas/user.schema';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Run seeds if database is empty
  try {
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const userCount = await userModel.estimatedDocumentCount();
    if (userCount === 0) {
      console.log('🗄️ پایگاه داده خالی است — در حال اجرای seed data...');
      await runSeed(app);
      console.log('✅ seed data با موفقیت بارگذاری شد');
    }
  } catch (err) {
    console.error('⚠️ خطا در بررسی/اجرای seed:', err);
  }

  // Serve uploaded files statically
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      process.env.ADMIN_URL ?? 'http://localhost:5174',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Action Life API')
    .setDescription('API برای پلتفرم Action Life')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
