import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';

// import services
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

// import DTOs
import { UserDataDto } from '../users/dtos/userData.dto';
import { ResponseDto } from '../global/dtos/response.dto';
import { AccessToken } from './dtos/accessToken.dto';
import { EncryptService } from '../users/services/encrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private encryptService: EncryptService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pwd: string): Promise<UserDataDto | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('此Email尚未註冊');
    }

    // 排除敏感資訊
    if (await this.encryptService.isPasswordCorrect(pwd, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: UserDataDto): Promise<ResponseDto<AccessToken>> {
    const payload = {
      username: user?.name,
      sub: user?.id,
      email: user?.email,
      role: user?.role,
    };
    return new ResponseDto('使用者登入成功', HttpStatus.OK, {
      accessToken: this.jwtService.sign(payload),
    });
  }

  logout(): ResponseDto<[]> {
    return new ResponseDto('使用者成功登出', HttpStatus.OK, []);
  }
}
