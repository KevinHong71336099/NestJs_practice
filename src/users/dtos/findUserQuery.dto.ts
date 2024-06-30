import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
export class FindUserQuery {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  page: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  limit: number;

  @IsString()
  @IsNotEmpty()
  orderBy: string;

  @IsString()
  name?: string;

  @IsString()
  email?: string;
}
