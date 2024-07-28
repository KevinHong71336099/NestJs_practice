import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CreateOrderDto } from '../orders/dtos/createOrder.dto';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { UserDataDto } from '../users/dtos/userData.dto';

@Controller('guest')
export class GuestController {
  constructor(
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  // Order services
  @Get('/orders/:id')
  async findOrderById(
    @Param('id') id: string,
    @Req() req: Request | any,
  ): Promise<Order> {
    return await this.ordersService.findOrderById(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Post('/orders')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request | any,
  ): Promise<Order> {
    return await this.ordersService.createOrder(
      createOrderDto,
      req.user.id,
      req.user.role,
    );
  }

  // Product services
  @Post('/products/:id/addToCart')
  async addProductToCart(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Body('stockQuantity') stockQuantity: number,
  ): Promise<string> {
    const guest = req.user as UserDataDto;
    return await this.productsService.addToCart(guest.id, id, stockQuantity);
  }

  @Delete('/products/:id/deleteFromCart')
  async deleteProductFromCart(
    @Param('id') id: string,
    @Req() req: Request | any,
  ): Promise<string> {
    const guest = req.user as UserDataDto;
    return await this.productsService.deleteFromCart(guest.id, id);
  }
}
