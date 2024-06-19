import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
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
  async findOne(@Param('id') id: string) {
    const userId = Number(id);
    return this.usersService.findUser(userId);
  }

  @Get()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return await this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = Number(id);
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const userId = Number(id);
    return this.usersService.deleteUser(userId);
  }
}
