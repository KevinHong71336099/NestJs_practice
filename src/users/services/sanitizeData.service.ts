import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserDataDto } from '../dtos/userData.dto';

@Injectable()
export class SanitizeDataService {
  sanitizeUserData(user: User): UserDataDto {
    const { id, name, email } = user;
    return { id, name, email };
  }
}
