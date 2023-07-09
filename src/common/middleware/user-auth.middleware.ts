import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { CommonService } from '../services/common.service';

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(private readonly commonService: CommonService) {}

  async use(req: Request, _: Response, next: (error?: any) => void) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const accessToken = authHeader.split(' ')[1];
    if (accessToken) await this.commonService.setAccessTokenUser(accessToken);
    next();
  }
}
