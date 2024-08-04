import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { LineItem } from './entities/lineItem.entity';
import { ProductInfo } from './dtos/productInfo.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
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

  async findOrderByQuery(
    query: FindOrderQuery,
    roleId: string,
    role: string,
  ): Promise<Order[]> {
    try {
      const orderBy = query.orderBy.split(':')[0];
      const orderDirection = query.orderBy.split(':')[1];

      const queryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.admin', 'admin')
        .leftJoinAndSelect('order.guest', 'guest')
        .where('CAST(order.id AS TEXT) ILIKE :orderId', {
          orderId: `%${query.orderId}%`,
        });

      if (query.financialStatus) {
        queryBuilder.andWhere('order.financialStatus = :financialStatus', {
          financialStatus: query.financialStatus,
        });
      }

      if (query.fulfillmentStatus) {
        queryBuilder.andWhere('order.fulfillStatus = :fulfillmentStatus', {
          fulfillStatus: query.fulfillmentStatus,
        });
      }

      queryBuilder
        .orderBy(
          `order.${orderBy}`,
          orderDirection.toUpperCase() as 'ASC' | 'DESC',
        )
        .skip((query.page - 1) * query.limit)
        .take(query.limit);

      if (role === 'guest') {
        queryBuilder.andWhere('guest.id = :roleId', { roleId });
      }

      return await queryBuilder.getMany();
    } catch (err) {
      console.error('Error in findOrderByQuery:', err.message, err.stack);
      throw new InternalServerErrorException('搜尋訂單失敗');
    }
  }

  async findOrderById(
    id: string,
    roleId: string,
    role: string,
  ): Promise<Order> {
    // 搜尋訂單相關聯的商品資訊

    const conditions: any = {
      where: { id },
      relations: ['admin', 'lineItems'],
    };

    // role為guest則限定只能搜尋該用戶的orders
    if (role === 'guest') {
      conditions.where.guest = { id: roleId };
    }

    const order = await this.orderRepository.findOne(conditions);
    if (!order) {
      throw new NotFoundException(`找不到 id: ${id} 的 訂單`);
    }
    return order;
  }

  async createOrder(
    createOrderDto: CreateOrderDto,
    roleId: string,
    role: string,
  ): Promise<Order> {
    const productInfos: ProductInfo[] = JSON.parse(createOrderDto.productInfos);
    console.log(productInfos);
    // 根據 role 設定 adminId 和 guestId
    const adminId = role === 'admin' ? roleId : createOrderDto.userId;
    const guestId = role === 'admin' ? createOrderDto.userId : roleId;

    // 查詢 admin 和 guest
    const [admin, guest] = await Promise.all([
      this.usersService.findUserById(adminId),
      this.usersService.findUserById(guestId),
    ]);

    if (!admin) {
      throw new NotFoundException(`找不到 id: ${adminId} 的admin`);
    }

    if (!guest) {
      throw new NotFoundException(`找不到 id: ${guestId} 的guest`);
    }

    // 建立order instance
    const newOrder = await this.orderRepository.create({
      admin,
      guest,
      note: createOrderDto.note,
      financialStatus: 'defaultStatus',
      fulfillmentStatus: 'defaultStatus',
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

    /*
    for (let i = 0; i < productInfos.length; i++) {
      newOrder.lineItems.push(
        this.lineItemRepository.create({
          productId: productInfos[i].productId,
          name: productsInOrder[i].name,
          price: productsInOrder[i].sellPrice,
          quantity: productInfos[i].stockQuantity,
          order: newOrder,
          product: productsInOrder[i],
        }),
      );
    }
      */

    // 創建 LineItems 並添加到 order
    newOrder.lineItems = productInfos.map((productInfo, index) =>
      this.lineItemRepository.create({
        productId: productInfo.productId,
        name: productsInOrder[index].name,
        price: productsInOrder[index].sellPrice,
        quantity: productInfo.stockQuantity,
        product: productsInOrder[index],
      }),
    );

    console.log(newOrder);

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
