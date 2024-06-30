import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dtos/createProduct.dto';
import { ProductsService } from './products.service';

@Controller('/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }
}
