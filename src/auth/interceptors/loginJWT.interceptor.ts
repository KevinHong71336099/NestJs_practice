import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class LoginJWTInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private authService: AuthService,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      switchMap(async (data) => {
        // 將${userId}:login 作為key保存 jwt token至redis, TTL:3600s
        const req = context.switchToHttp().getRequest();
        const userId = req.user.id;
        const jwtToken = data.accessToken;

        // 保存至 Redis
        await this.cacheManager.set(`${userId}:login`, jwtToken, 3600);

        // 同時也保存至 PostgreSQL
        await this.authService.saveOrUpdateToken(userId, jwtToken);

        // 返回原始的 response 資料
        return data;
      }),
    );
  }
}
