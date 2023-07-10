import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaResourceModule } from 'src/media-resources/media-resource.module';
import { UsersModule } from 'src/users/users.module';
import { FeedController } from './controllers/feed.controller';
import { FeedRepository } from './repositories/feed.repository';
import { Feed, FeedSchema } from './schema/feed.schema';
import { FeedService } from './services/feed.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
    MediaResourceModule,
    UsersModule,
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService, FeedRepository],
})
export class FeedModule {}
