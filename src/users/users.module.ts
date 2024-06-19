import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ComfirmFormService } from './services/confirmUserForm.service';
import { EncryptService } from './services/encrypt.service';
import { SanitizeDataService } from './services/sanitizeData.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    ComfirmFormService,
    EncryptService,
    SanitizeDataService,
  ],
})
export class UsersModule {}
