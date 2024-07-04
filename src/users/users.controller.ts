import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

// import services
import { UsersService } from './users.service';

// import entities
import { User } from './entities/user.entity';

// import DTO
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UserDataDto } from './dtos/userData.dto';
import { FindUserQuery } from './dtos/findUserQuery.dto';
import { Roles } from 'src/global/decorators/roles.decorators';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findUserById(id);
  }

  @Get()
  async findUserByQuery(@Query() query: FindUserQuery): Promise<User[]> {
    return await this.usersService.findUserByQuery(query);
  }

  @Get()
  @Roles(['admin'])
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
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return this.usersService.deleteUser(id);
  }
}
