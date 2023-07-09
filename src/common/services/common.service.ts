import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from 'src/users/repositories/user.repository';
import { setUser } from 'src/utils/request-store/request-store';

@Injectable()
export class CommonService {
  constructor(private readonly userRepo: UserRepository) {}

  async setAccessTokenUser(accessToken: string) {
    const user = await this.getUserByAccessToken(accessToken);
    if (!user || !user.isActive) return;
    setUser(user);
  }

  async getUserByAccessToken(accessToken: string) {
    const payload = this.getPayload(accessToken);
    if (!payload) return;

    return this.userRepo.findById(payload.id);
  }

  getPayload(sessionToken: string) {
    try {
      const payload = jwt.verify(sessionToken, process.env.JWT_SECRET);
      return {
        id: payload['id'],
      };
    } catch (err: any) {
      console.error(err);
    }
  }
}
