import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsProductNameAlreadyExist } from '../validator/productName.validator';

export class CreateProductDto {
  @IsString({ message: '姓名欄位必須是字串' })
  @IsNotEmpty({ message: '姓名欄位不能為空' })
  @IsProductNameAlreadyExist()
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: '成本欄位不能為空' })
  costPrice: number;

  @IsNumber()
  @IsNotEmpty({ message: '售價欄位不能為空' })
  sellPrice: number;

  @IsOptional()
  @IsString({ message: '介紹欄位必須是字串' })
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: '庫存數量欄位不能為空' })
  stockQuantity: number;

  @IsString()
  @IsNotEmpty({ message: '商品狀態欄位不能為空' })
  productStatus: string;
}
