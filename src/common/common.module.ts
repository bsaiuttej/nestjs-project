import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { UserAuthGuard } from './guards/user-auth.guard';
import { UserAuthMiddleware } from './middleware/user-auth.middleware';
import { CommonService } from './services/common.service';

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
    CommonService,
  ],
  exports: [CommonService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware).forRoutes('*');
  }
}
