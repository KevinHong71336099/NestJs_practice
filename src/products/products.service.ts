import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dtos/createProduct.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async findProductByName(name: string): Promise<Product | null> {
    try {
      return await this.productRepository.findOneBy({ name });
    } catch (err) {
      throw new InternalServerErrorException('尋找商品失敗');
    }
  }

  async createProduct(createdProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = this.productRepository.create(createdProductDto);
      await this.productRepository.insert(newProduct);
      return newProduct;
    } catch (err) {
      throw new InternalServerErrorException('創建商品失敗');
    }
  }
}
