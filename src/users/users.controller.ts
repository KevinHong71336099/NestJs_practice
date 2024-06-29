import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

// import services
import { UsersService } from './users.service';

// import DTO
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UserDataDto } from './dtos/userData.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<{ user: UserDataDto | null }>> {
    return this.usersService.findUser(id);
  }

  @Get()
  async findAll(): Promise<ResponseDto<{ users: UserDataDto[] }>> {
    return await this.usersService.findAllUsers();
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return await this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return this.usersService.deleteUser(id);
  }
}
