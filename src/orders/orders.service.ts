import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { LineItem } from './entities/lineItem.entity';
import { ProductInfo } from './dtos/productInfo.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(LineItem)
    private lineItemRepository: Repository<LineItem>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    adminId: string,
  ): Promise<Order> {
    const productInfos: ProductInfo[] = JSON.parse(createOrderDto.productInfos);

    // 尋找 admin 與 guest instance
    const [admin, guest] = await Promise.all([
      this.usersService.findUserById(adminId),
      this.usersService.findUserById(createOrderDto.userId),
    ]);

    if (!admin) {
      throw new NotFoundException(`找不到 id: ${adminId} 的admin`);
    }

    if (!guest) {
      throw new NotFoundException(
        `找不到 id: ${createOrderDto.userId} 的guest`,
      );
    }

    // 建立order instance
    const newOrder = await this.orderRepository.create({
      admin,
      guest,
      financialStatus: createOrderDto.financialStatus,
      fulfillmentStatus: createOrderDto.fulfillmentStatus,
      note: createOrderDto.note,
      lineItems: [],
    });

    // 搜尋order中的products
    const productsInOrder: Product[] = await Promise.all(
      productInfos.map(async (productInfo) => {
        const product = await this.productsService.findProductById(
          productInfo.productId,
        );
        if (!product) {
          throw new NotFoundException(
            `找不到 id: ${productInfo.productId} 的產品`,
          );
        }
        return product;
      }),
    );

    // 對每個product建立lineItemObject並與order關聯
    for (let i = 0; i < productInfos.length; i++) {
      newOrder.lineItems.push(
        this.lineItemRepository.create({
          orderId: newOrder.id,
          productId: productInfos[i].productId,
          name: productsInOrder[i].name,
          price: productsInOrder[i].sellPrice,
          quantity: productInfos[i].stockQuantity,
          order: newOrder,
          product: productsInOrder[i],
        }),
      );
    }

    // 保存order
    return await this.orderRepository.save(newOrder);
  }
}
