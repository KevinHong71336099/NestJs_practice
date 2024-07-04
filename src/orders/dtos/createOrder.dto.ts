import {
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  isNotEmpty,
} from 'class-validator';

export class CreateOrderDto {
  @IsJSON()
  @IsNotEmpty()
  productInfos: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  financialStatus: string;

  @IsString()
  @IsNotEmpty()
  fulfillmentStatus: string;
}
