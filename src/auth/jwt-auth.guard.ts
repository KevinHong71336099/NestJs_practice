import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly excludeRoutes = ['/auth/login'];
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // 檢查是否為 excludeRoutes
    if (this.excludeRoutes.includes(request.route.path)) {
      return true; // 不應用守衛
    }

    // 否則套用gurad
    return super.canActivate(context);
  }
}
