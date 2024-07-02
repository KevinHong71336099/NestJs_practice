import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatedProductDto } from './dtos/createdProduct.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsOrderValue, ILike, Repository } from 'typeorm';
import { UpdatedProductDto } from './dtos/updatedProduct.dto';
import { FindProductQuery } from './dtos/findProductQuery.dto';

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

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('找不到該商品');
    }
    return product;
  }

  async findProductByQuery(query: FindProductQuery): Promise<Product[]> {
    // 設定搜尋排序
    const orderBy = query.orderBy.split(':')[0];

    // 判斷否需要設定Price查詢條件
    const isSetPriceCondition = query.priceGreatThan || query.priceGreatThan;

    // 設定搜尋條件
    const conditions: any = {
      where: [{ name: ILike(`%${query.name}%`) }],
      order: {
        [orderBy]: `${query.orderBy.split(':')[1]}` as FindOptionsOrderValue,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    };

    if (isSetPriceCondition) {
      // 設定價格搜尋區間
      const priceGreatThan = query.priceGreatThan || 1;
      const priceLessThan = query.priceLessThan || Number.MAX_SAFE_INTEGER;
      conditions.where.push({
        sellPrice: Between(priceGreatThan, priceLessThan),
      });
    }

    return this.productRepository.find(conditions);
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

  async updateProduct(
    id: string,
    updatedProductDto: UpdatedProductDto,
  ): Promise<Product | null> {
    try {
      await this.productRepository.update(id, updatedProductDto);
      return await this.productRepository.findOneBy({ id });
    } catch {
      throw new InternalServerErrorException('更新商品失敗');
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    const deletedProduct = await this.productRepository.findOneBy({ id });
    if (!deletedProduct) {
      throw new NotFoundException('找不到該商品');
    }
    await this.productRepository.delete(id);
    return deletedProduct;
  }
}
