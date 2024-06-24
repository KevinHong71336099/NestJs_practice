import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDataDto } from 'src/users/dtos/userData.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserDataDto> {
    // 本地策略驗證email與password
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤!');
    }

    return user;
  }
}
