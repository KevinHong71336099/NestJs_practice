import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProductsService } from './products.service';

// import entities
import { Product } from './entities/product.entity';

// import Dtos
import { CreatedProductDto } from './dtos/createdProduct.dto'
import { UpdatedProductDto } from './dtos/updatedProduct.dto';

@Controller('/products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Post()
  async createProduct(@Body() createdProductDto: CreatedProductDto): Promise<Product> {
    return await this.productsService.createProduct(createdProductDto);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() updatedProductDto: UpdatedProductDto): Promise<Product | null> {
    return await this.productsService.updateProduct(id, updatedProductDto)
  }
}
