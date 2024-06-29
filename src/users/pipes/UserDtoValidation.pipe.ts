import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UpdateUserDto } from '../dtos/UpdateUserDto';

@Injectable()
export class UserDtoValidationPipe implements PipeTransform<any> {
  // 設定需要檢驗的dto類型
  private readonly dtoTypes: Function[] = [CreateUserDto, UpdateUserDto];

  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 若傳入非驗證的資料型態，則拋出錯誤
    if (!metatype || !this.toValidate(metatype)) {
      throw new BadRequestException('metaType不符');
    }

    // 轉換plain object 並進行驗證
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      // 返回不符合的屬性
      const errorMessages = errors.map((err) => {
        return {
          property: err.property,
          constraints: err.constraints,
        };
      });
      throw new BadRequestException({
        message: 'metaType驗證失敗',
        errors: errorMessages,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    return this.dtoTypes.includes(metatype);
  }
}
