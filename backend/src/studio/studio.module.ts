import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudioController } from './studio.controller';
import { StudioService } from './studio.service';
import { StudioFile, StudioFileSchema } from './schemas/studio-file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudioFile.name, schema: StudioFileSchema },
    ]),
  ],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService],
})
export class StudioModule {}
