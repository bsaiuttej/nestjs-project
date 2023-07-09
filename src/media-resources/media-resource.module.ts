import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaResource, MediaResourceSchema } from './schemas/media-resource.schema';
import { MediaResourceManager } from './services/media-resource-manager';
import { MediaResourceService } from './services/media-resource.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: MediaResource.name, schema: MediaResourceSchema }])],
  providers: [MediaResourceService, MediaResourceManager],
  exports: [MediaResourceService],
})
export class MediaResourceModule {}
