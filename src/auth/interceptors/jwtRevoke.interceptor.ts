import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRevokeInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<[]>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const bearerToken = authHeader.split(' ')[1];

    if (!bearerToken) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    return next.handle().pipe(
      tap(async () => {
        // 將user id 作為key保存 jwt token至redis, TTL:3600s
        const userId = request.user.id;
        await this.cacheManager.set(`${userId}`, bearerToken, 3600);
      }),
    );
  }
}
