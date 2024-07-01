import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatedProductDto } from './dtos/createdProduct.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatedProductDto } from './dtos/updatedProduct.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) { }

  async findProductByName(name: string): Promise<Product | null> {
    try {
      return await this.productRepository.findOneBy({ name });
    } catch (err) {
      throw new InternalServerErrorException('尋找商品失敗');
    }
  }

  async createProduct(createdProductDto: CreatedProductDto): Promise<Product> {
    try {
      const newProduct = this.productRepository.create(createdProductDto);
      await this.productRepository.insert(newProduct);
      return newProduct;
    } catch (err) {
      throw new InternalServerErrorException('創建商品失敗');
    }
  }

  async updateProduct(id: string, updatedProductDto: UpdatedProductDto): Promise<Product | null> {
    try {
      await this.productRepository.update(id, updatedProductDto)
      return await this.productRepository.findOneBy({ id })

    } catch {
      throw new InternalServerErrorException('更新商品失敗')
    }
  }
}
