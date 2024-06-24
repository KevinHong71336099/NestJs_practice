import { Injectable } from '@nestjs/common';

// import typeORM's repository
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import DTOs & interfaces
import { CreateUserDto } from '../dtos/CreateUserDto';

// import user entity
import { User } from '../entities/user.entity';
import { EncryptService } from './encrypt.service';

// 設定每個模式需要驗證的欄位
const confirmTypes = {
  createUser: ['name', 'email', 'password', 'confirmPassword'],
};

@Injectable()
export class ComfirmFormService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    encryptService: EncryptService,
  ) {}

  isCreateUserDtoValid(createUserDto: CreateUserDto): boolean {
    // 檢查需要驗證的欄位是否為空
    for (const key of confirmTypes.createUser) {
      if (!createUserDto[key as keyof CreateUserDto]) {
        return false;
      }
    }
    return true;
  }

  isPasswordValid(password: string, confirmPassword: string): boolean {
    // 檢驗密碼驗證是否相同
    return password === confirmPassword ? true : false;
  }

  async isRegisteredEmail(email: string): Promise<boolean> {
    // 檢驗是否存在該email
    const user = await this.usersRepository.findOneBy({ email });
    return user ? true : false;
  }
}
