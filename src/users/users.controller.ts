import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';

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
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
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
