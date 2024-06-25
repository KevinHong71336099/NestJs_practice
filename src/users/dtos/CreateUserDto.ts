import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: '姓名欄位必須是字串' })
  @IsNotEmpty({ message: '姓名欄位不能為空' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email欄位不能為空' })
  email: string;

  @IsString({ message: '密碼欄位必須是字串' })
  @IsNotEmpty({ message: '密碼欄位不能為空' })
  password: string;

  @IsString({ message: '驗證欄位必須是字串' })
  @IsNotEmpty({ message: '驗證欄位不能為空' })
  confirmPassword: string;
}
