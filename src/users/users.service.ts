import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';

// import typeORM's repository
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import entities
import { User } from './entities/user.entity';

// import DTOs & interfaces
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { updatedInfo } from './interfaces/updatedInfo.interface';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UserDataDto } from './dtos/userData.dto';

// import services
import { ComfirmFormService } from './services/confirmUserForm.service';
import { EncryptService } from './services/encrypt.service';
import { SanitizeDataService } from './services/sanitizeData.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private confirmFormService: ComfirmFormService,
    private encryptService: EncryptService,
    private sanitizeDataService: SanitizeDataService,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const allUser = await this.usersRepository.find();
    return allUser;
  }

  async findUser(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    // 檢驗欄位是否為空
    if (!this.confirmFormService.isCreateUserDtoValid(createUserDto)) {
      throw new BadRequestException('必填欄位不能為空');
    }

    // 帳號是否註冊
    if (await this.confirmFormService.isRegisteredEmail(createUserDto.email)) {
      throw new BadRequestException('Email已註冊過，請使用其他email註冊');
    }

    // 驗證密碼是否通過
    if (
      !this.confirmFormService.isPasswordValid(
        createUserDto.password,
        createUserDto.confirmPassword,
      )
    ) {
      throw new BadRequestException('請確認密碼是否填寫正確');
    }

    try {
      // bcrypt為使用者密碼加密
      const encryptedPwd = await this.encryptService.bcryptUserPassword(
        createUserDto.password,
      );
      const newUser = this.usersRepository.create(createUserDto);
      newUser.password = encryptedPwd;

      // 成功將user新增至資料庫
      await this.usersRepository.insert(newUser);

      return new ResponseDto('使用者建立成功', HttpStatus.OK, {
        user: this.sanitizeDataService.sanitizeUserData(newUser),
      });
    } catch (err) {
      // 用戶建立失敗
      throw new InternalServerErrorException('創建用戶失敗');
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const updatedUserInfo: updatedInfo = {
      ...updateUserDto,
    };
    delete updatedUserInfo.confirmPassword;
    await this.usersRepository.update(id, updatedUserInfo);
    const updatedUser = await this.usersRepository.findOneBy({ id });
    return updatedUser;
  }

  async deleteUser(id: number): Promise<User | null> {
    const deletedUser = await this.usersRepository.findOneBy({ id });
    await this.usersRepository.delete(id);
    return deletedUser;
  }
}
