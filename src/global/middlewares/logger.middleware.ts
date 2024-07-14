import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', () => {
      const { method, originalUrl } = req;
      const user = req.user as User;
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const executionTime = Date.now() - startTime;

      let logMessage = '';

      logMessage += `Executioin Time: ${executionTime}- Call by: ${user.id}, Method: ${method}, OriginalUrl: ${originalUrl}, StatusCode: ${statusCode}, ContentLength: ${contentLength} `;

      if (method !== 'GET') {
        logMessage += `, Body: ${JSON.stringify(req.body)}`;
      }

      if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
