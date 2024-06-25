import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: '姓名欄位必須是字串' })
  @IsNotEmpty({ message: '姓名欄位不能為空' })
  name: string;

  @IsString({ message: '密碼欄位必須是字串' })
  @IsNotEmpty({ message: '密碼欄位不能為空' })
  password: string;

  @IsString({ message: '驗證欄位必須是字串' })
  @IsNotEmpty({ message: '驗證欄位不能為空' })
  confirmPassword: string;
}
