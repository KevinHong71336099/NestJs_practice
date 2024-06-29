import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtRevokeGuard implements CanActivate {
  private readonly excludeRoutes = ['/auth/login'];

  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const route = request.route.path;

    // 排除特定路由
    if (this.isExcludedRoute(route)) {
      return true;
    }

    // 驗證 jwt token 中的 user id 是為 redis的 key 存放 revoke token
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header 不存在');
    }

    const bearerToken = this.extractBearerToken(authHeader);

    return await this.validateJwtToken(bearerToken);
  }

  private isExcludedRoute(route: string): boolean {
    return this.excludeRoutes.includes(route);
  }

  private extractBearerToken(authHeader: string): string {
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0].localeCompare('Bearer')) {
      throw new UnauthorizedException('不合法的 Authorization header 格式');
    }

    return parts[1];
  }

  private async validateJwtToken(token: string): Promise<boolean> {
    let decodedJwtAccessToken: JwtPayload;
    try {
      decodedJwtAccessToken = this.jwtService.decode(token);
    } catch (error) {
      throw new UnauthorizedException('不合法的 jwt token');
    }

    const userId = String(decodedJwtAccessToken?.sub);

    if (!userId) {
      throw new UnauthorizedException('不合法的 jwt payload');
    }

    const revokeToken: string | undefined = await this.cacheManager.get(userId);

    // 若不存在revoke token 則通過， 存在則比較token是否為revoke
    return !revokeToken ? true : !(token === revokeToken);
  }
}
