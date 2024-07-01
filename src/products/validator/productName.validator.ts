import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsProductNameExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private productsService: ProductsService) {}

  async validate(name: string, args: ValidationArguments) {
    // 獲取dto中id欄位
    const productId: string | undefined = (args.object as any).id;

    // 返回 true 表示驗證通過（名稱不存在）
    const product = await this.productsService.findProductByName(name);

    // updateDto驗證: 檢查更新是否存在於database
    if (productId) {
      return !product || product.id === productId;
    }

    // createdDto驗證
    return !product;
  }

  defaultMessage(args: ValidationArguments) {
    return '產品名稱 $value 已經存在';
  }
}

export function IsProductNameAlreadyExist(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProductNameExistConstraint,
    });
  };
}
