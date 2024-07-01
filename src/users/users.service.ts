import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';

// import typeORM's repository
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrderValue, ILike, Repository } from 'typeorm';

// import entities
import { User } from './entities/user.entity';

// import DTOs & interfaces
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { updatedInfo } from './interfaces/updatedInfo.interface';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UserDataDto } from './dtos/userData.dto';
import { FindUserQuery } from './dtos/findUserQuery.dto';

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

  async findAllUsers(): Promise<ResponseDto<{ users: UserDataDto[] }>> {
    const allUsers = await this.usersRepository.find({
      select: ['id', 'name', 'email'],
    });
    return new ResponseDto('成功搜尋所有使用者', HttpStatus.OK, {
      users: allUsers,
    });
  }

  async findUser(id: number): Promise<ResponseDto<{ user: UserDataDto }>> {
    const user = await this.usersRepository.findOneBy({ id });

    // 未找到該使用者
    if (!user) {
      throw new NotFoundException('找不到該使用者');
    }

    return new ResponseDto(`成功搜尋 ID:${user?.id} 使用者`, HttpStatus.OK, {
      user: this.sanitizeDataService.sanitizeUserData(user),
    });
  }

  async findUserByQuery(query: FindUserQuery): Promise<User[]> {
    const orderField =
      query.orderBy === 'createdAt' ? 'createdAt' : 'updatedAt';

    return await this.usersRepository.find({
      where: [
        { name: ILike(`%${query?.name}%`) },
        { email: ILike(`%${query?.name}%`) },
      ],
      order: {
        [orderField]: `${query.orderBy.split(':')[1]}` as FindOptionsOrderValue,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
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
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    // 驗證密碼是否通過
    if (
      !this.confirmFormService.isPasswordValid(
        updateUserDto.password,
        updateUserDto.confirmPassword,
      )
    ) {
      throw new BadRequestException('請確認密碼是否填寫正確');
    }

    const updatedUserInfo: updatedInfo = { ...updateUserDto };
    delete updatedUserInfo.confirmPassword;

    await this.usersRepository.update(id, updatedUserInfo);
    const updatedUser = await this.usersRepository.findOneBy({ id });

    if (!updatedUser) {
      throw new NotFoundException('找不到該使用者');
    }

    return new ResponseDto(
      `成功更新 ID:${updatedUser?.id} 使用者`,
      HttpStatus.OK,
      { user: this.sanitizeDataService.sanitizeUserData(updatedUser) },
    );
  }

  async deleteUser(id: number): Promise<ResponseDto<{ user: UserDataDto }>> {
    const deletedUser = await this.usersRepository.findOneBy({ id });
    if (!deletedUser) {
      throw new NotFoundException('找不到該使用者');
    }

    await this.usersRepository.delete(id);
    return new ResponseDto(
      `成功刪除 ID: ${deletedUser.id} 使用者`,
      HttpStatus.OK,
      { user: this.sanitizeDataService.sanitizeUserData(deletedUser) },
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }
}
