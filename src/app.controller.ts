import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';
import { UserDataDto } from './users/dtos/userData.dto';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: Request) {
    const user = req.user as UserDataDto;
    return this.authService.login(user);
  }
}
