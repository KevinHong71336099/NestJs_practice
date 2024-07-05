import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class FindOrderQuery {
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

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  financialStatus: string;

  @IsOptional()
  @IsString()
  fulfillmentStatus: string;
}
