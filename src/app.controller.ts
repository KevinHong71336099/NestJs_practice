import {
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Request } from 'express';
import { AuthService } from './auth/auth.service';
import { UserDataDto } from './users/dtos/userData.dto';
import { ResponseDto } from './global/dtos/response.dto';
import { JwtRevokeInterceptor } from './auth/interceptors/jwtRevoke.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: Request) {
    const user = req.user as UserDataDto;
    return this.authService.login(user);
  }

  @UseInterceptors(JwtRevokeInterceptor)
  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(): Promise<ResponseDto<[]>> {
    return this.authService.logout();
  }
}
