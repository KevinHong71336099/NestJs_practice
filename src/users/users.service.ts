import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { updatedInfo } from './interfaces/updatedInfo.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const allUser = await this.usersRepository.find();
    return allUser;
  }

  async findUser(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.usersRepository.create(createUserDto);
    await this.usersRepository.insert(newUser);
    return newUser;
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
