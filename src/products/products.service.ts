import {
  Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ProductInfo } from 'src/orders/dtos/productInfo.dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async addToCart(
    userId: string,
    productId: string,
    stockQuantity: number,
  ): Promise<string> {
    try {
      // 設定新增購物車商品資訊
      const newProductInfo: ProductInfo = { productId, stockQuantity };

      // 建立redis key
      const key = 'cart:'.concat(userId);

      // 宣告商品資訊暫存
      let productInfos: ProductInfo[] = [];
      let productInfosJson: string | undefined =
        await this.cacheManager.get(key);

      if (productInfosJson) {
        // 已建立的情況則將新增項目加入
        productInfos = JSON.parse(productInfosJson);
      }

      productInfosJson = JSON.stringify(productInfos.push(newProductInfo));
      await this.cacheManager.set(key, productInfosJson, 3600);

      return `商品 id: ${[productId]} 成功加入購物車`;
    } catch (err) {
      throw new InternalServerErrorException('購物車加入商品失敗，請再次嘗試');
    }
  }

  async deleteFromCart(userId: string, productId: string): Promise<string> {
    try {
      // 建立redis key
      const key = 'cart:'.concat(userId);
      const productInfosJson: string | undefined =
        await this.cacheManager.get(key);

      if (productInfosJson) {
        // 已建立的情況
        const productInfos: ProductInfo[] = JSON.parse(productInfosJson);
        const findIdx = productInfos.findIndex(
          (productInfo) => productInfo.productId === productId,
        );

        // 若 id 不存在
        if (!findIdx) {
          throw new NotFoundException(`商品 id: ${productId}不存在於購物車中`);
        }

        // 刪除該商品
        productInfos.splice(findIdx, 1);

        // 更新購物車商品id
        await this.cacheManager.set(key, JSON.stringify(productInfos), 3600);
      }

      return '商品 id: ${[productId]} 成功從購物車移除';
    } catch (err) {
      throw new InternalServerErrorException('購物車刪除商品失敗，請再次嘗試');
    }
  }
}
