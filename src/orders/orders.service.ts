import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { FindOptionsOrderValue, ILike, Repository } from 'typeorm';
import { LineItem } from './entities/lineItem.entity';
import { ProductInfo } from './dtos/productInfo.dto';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { UpdateOrderDto } from './dtos/updateOrder.dto';
import { FindOrderQuery } from './dtos/findOrderQuery.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(LineItem)
    private lineItemRepository: Repository<LineItem>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async findOrderByQuery(query: FindOrderQuery): Promise<Order[]> {
    try {
      // 設定搜尋排序
      const orderBy = query.orderBy.split(':')[0];

      // 設定搜尋條件
      const conditions: any = {
        relations: {
          admin: true,
          guest: true,
        },
        where: {
          id: ILike(`%${query.orderId}%`),
          financialStatus: query.financialStatus,
          fulfillStatus: query.fulfillmentStatus,
        },
        order: {
          [orderBy]: `${query.orderBy.split(':')[1]}` as FindOptionsOrderValue,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      };

      return await this.orderRepository.find(conditions);
    } catch (err) {
      throw new InternalServerErrorException('搜尋訂單失敗');
    }
  }

  async findOrderById(id: string): Promise<Order> {
    // 搜尋訂單相關聯的商品資訊
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { lineItems: { product: true } },
    });
    if (!order) {
      throw new NotFoundException(`找不到 id: ${id} 的 訂單`);
    }
    return order;
  }

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

  async updateOrder(
    updateOrderDto: UpdateOrderDto,
    adminId: string,
    orderId: string,
  ): Promise<Order> {
    // 查詢該id order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['lineItems'],
    });

    if (!order) {
      throw new NotFoundException('找不到 id: ${adminId} 的order');
    }

    // 尋找 admin 與 guest instance
    const [admin, guest] = await Promise.all([
      order.admin.id !== adminId
        ? this.usersService.findUserById(adminId)
        : order.admin,
      order.guest.id !== updateOrderDto.userId
        ? this.usersService.findUserById(updateOrderDto.userId)
        : order.guest,
    ]);

    if (!admin) {
      throw new NotFoundException(`找不到 id: ${adminId} 的admin`);
    }

    if (!guest) {
      throw new NotFoundException(
        `找不到 id: ${updateOrderDto.userId} 的guest`,
      );
    }

    // 更新order
    order.admin = admin;
    order.guest = guest;

    order.financialStatus =
      updateOrderDto.financialStatus !== order.financialStatus
        ? updateOrderDto.financialStatus
        : order.financialStatus;

    order.fulfillmentStatus =
      updateOrderDto.fulfillmentStatus !== order.fulfillmentStatus
        ? updateOrderDto.fulfillmentStatus
        : order.fulfillmentStatus;

    // 更新欲刪除&新增商品
    const productInfos: ProductInfo[] = JSON.parse(updateOrderDto.productInfos);
    const updateProductIds = productInfos.map(
      (productInfo) => productInfo.productId,
    );
    order.lineItems = order.lineItems.filter((lineItem) => {
      return updateProductIds.includes(lineItem.productId);
    });

    // 將 updateProductIds 中不存在於 lineItems 的 productId 新增進去
    for (const productInfo of productInfos) {
      if (
        !order.lineItems.some(
          (lineItem) => lineItem.productId === productInfo.productId,
        )
      ) {
        const product = await this.productsService.findProductById(
          productInfo.productId,
        );
        if (!product) {
          throw new NotFoundException(
            `找不到 id: ${productInfo.productId} 的產品`,
          );
        }

        const newLineItem = this.lineItemRepository.create({
          orderId: order.id,
          productId: product.id,
          name: product.name,
          price: product.sellPrice,
          quantity: productInfo.stockQuantity,
          order: order,
          product: product,
        });

        order.lineItems.push(newLineItem);
      }
    }

    // 保存order
    return await this.orderRepository.save(order);
  }

  async deleteOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException('找不到該訂單');
    }
    await this.orderRepository.delete(id);
    return order;
  }
}
