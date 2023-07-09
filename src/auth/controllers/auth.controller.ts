import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginUserDto, RegisterUserDto } from '../dtos/user-auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('sign-up')
  async registerUser(@Body() body: RegisterUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.registerUser(body);
    this.service.setAccessToken(res, result.accessToken);
    res.json({ success: true });
  }

  @Post('login')
  async loginUser(@Body() body: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.loginUser(body);
    this.service.setAccessToken(res, result.accessToken);
    res.json({ success: true });
  }
}
