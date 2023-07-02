import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { mongoConfig } from './utils/mongoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGO_DB_HOST: Joi.string().required(),
        MONGO_DB_USERNAME: Joi.string().required(),
        MONGO_DB_PASSWORD: Joi.string().required(),
        MONGO_DB_DATABASE: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(mongoConfig().MONGO_URI),
    RolesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
