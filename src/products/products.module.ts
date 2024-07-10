import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { IsProductNameExistConstraint } from './validator/productName.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [IsProductNameExistConstraint, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
