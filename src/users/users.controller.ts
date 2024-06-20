import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

// import services
import { UsersService } from './users.service';

// import DTO
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { ResponseDto } from 'src/global/dtos/response.dto';
import { UserDataDto } from './dtos/userData.dto';

// import validation pipe
import { UserDtoValidationPipe } from './pipes/UserDtoValidation.pipe';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUser(id);
  }

  @Get()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Post()
  async create(
    @Body(UserDtoValidationPipe) createUserDto: CreateUserDto,
  ): Promise<ResponseDto<{ user: UserDataDto }>> {
    return await this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(UserDtoValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
