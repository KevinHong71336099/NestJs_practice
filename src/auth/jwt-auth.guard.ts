import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { LoginToken } from './entities/loginToken.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly excludeRoutes = ['/auth/login'];
  constructor(
    @InjectRepository(LoginToken)
    private loginTokenRepository: Repository<LoginToken>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 檢查是否為 excludeRoutes
    if (this.excludeRoutes.includes(request.route.path)) {
      return true; // 不應用守衛
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // jwt guard
    await super.canActivate(context); // 加上 `await` 確保異步操作完成

    const payload = this.jwtService.verify(token);
    const userId = payload.sub;

    // 查詢 Redis 獲取用戶 Token
    let userToken: string | undefined = await this.cacheManager.get(
      `${userId}:login`,
    );

    // 如果 Redis 中的 token 存在且不匹配，則返回 false
    if (userToken) {
      return token === userToken;
    }

    // 若不聞在於redis則查詢 Postgres 獲取用戶 Token
    userToken = (await this.loginTokenRepository.findOneBy({ userId }))?.token;

    if (!userToken || token !== userToken) {
      return false;
    }

    await this.cacheManager.set(`${userId}:login`, token, 3600);
    // 最終檢查是否匹配
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
