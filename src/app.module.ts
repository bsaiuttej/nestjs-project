import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { FeedModule } from './feed/feed.module';
import { MediaResourceModule } from './media-resources/media-resource.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { mongoConfig } from './utils/mongoose.config';
import { TasksModule } from './tasks/tasks.module';
import { UniqueIdGeneratorModule } from './unique-id-generator/unique-id-generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        TZ: Joi.string().default('UTC'),
        PORT: Joi.number().default(4000),
        PROJECT_ENV: Joi.string().default('development'),

        MONGO_DB_HOST: Joi.string().required(),
        MONGO_DB_USERNAME: Joi.string().required(),
        MONGO_DB_PASSWORD: Joi.string().required(),
        MONGO_DB_DATABASE: Joi.string().required(),

        AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
        AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_BUCKET_BASE_URL: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }).unknown(true),
    }),
    MongooseModule.forRoot(mongoConfig().MONGO_URI),
    EventEmitterModule.forRoot(),
    CommonModule,
    RolesModule,
    UsersModule,
    MediaResourceModule,
    AuthModule,
    FeedModule,
    TasksModule,
    UniqueIdGeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
