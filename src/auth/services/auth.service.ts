import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRepository } from 'src/users/repositories/user.repository';
import { User } from 'src/users/schemas/user.schema';
import { AccessTokenKey } from 'src/utils/constants';
import { LoginUserDto, RegisterUserDto } from '../dtos/user-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async registerUser(body: RegisterUserDto) {
    const email = await this.userRepo.countByEmail(body.email);
    if (email) {
      throw new BadRequestException(`There is already a user with this email ${body.email}`);
    }

    const user = this.userRepo.create(body);
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async loginUser(body: LoginUserDto) {
    const user = await this.userRepo.findUserIdByCredentials(body.username);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const valid = await user.correctPassword(body.password);
    if (!valid) {
      throw new BadRequestException('Wrong password');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_LIFETIME,
    });

    return { accessToken: token };
  }

  setAccessToken(res: Response, token: string) {
    res.header(AccessTokenKey, token);
  }
}
