import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const adminEmail = 'admin@actionlife.ir';
  const existing = await usersService.findByEmail(adminEmail);

  if (existing) {
    console.log('ادمین از قبل وجود دارد:', adminEmail);
  } else {
    await usersService.create({
      fullName: 'مدیر سایت',
      email: adminEmail,
      password: 'Admin@1234',
    });
    // نقش را مستقیماً به admin تغییر بده
    const user = await usersService.findByEmail(adminEmail);
    if (user) {
      user.role = UserRole.ADMIN;
      await user.save();
      console.log('ادمین ساخته شد!');
      console.log('ایمیل:', adminEmail);
      console.log('رمز عبور:', 'Admin@1234');
    }
  }

  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
