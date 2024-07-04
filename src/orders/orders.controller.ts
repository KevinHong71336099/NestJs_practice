import { Body, Controller, Post, Req } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { OrdersService } from './orders.service';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request | any,
  ): Promise<Order> {
    return await this.ordersService.createOrder(createOrderDto, req.user.id);
  }
}
