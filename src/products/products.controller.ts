import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';

// import entities
import { Product } from './entities/product.entity';

// import Dtos
import { CreatedProductDto } from './dtos/createdProduct.dto';
import { UpdatedProductDto } from './dtos/updatedProduct.dto';
import { FindProductQuery } from './dtos/findProductQuery.dto';

@Controller('/products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Get(':id')
  async findProductById(@Param('id') id: string): Promise<Product> {
    return await this.productsService.findProductById(id);
  }

  @Get()
  async findProductByQuery(
    @Query() query: FindProductQuery,
  ): Promise<Product[]> {
    return await this.productsService.findProductByQuery(query);
  }

  @Post()
  async createProduct(
    @Body() createdProductDto: CreatedProductDto,
  ): Promise<Product> {
    return await this.productsService.createProduct(createdProductDto);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updatedProductDto: UpdatedProductDto,
  ): Promise<Product | null> {
    return await this.productsService.updateProduct(id, updatedProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return await this.productsService.deleteProduct(id);
  }
}