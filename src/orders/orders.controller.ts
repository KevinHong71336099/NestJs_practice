import { Body, Controller, Param, Post, Put, Req } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { OrdersService } from './orders.service';
import { Request } from 'express';
import { UpdateUserDto } from 'src/users/dtos/UpdateUserDto';
import { UpdateOrderDto } from './dtos/updateOrder.dto';

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

  @Put(':id')
  async updateOrder(
    @Body() updateOrderDto: UpdateOrderDto,
    @Param('id') orderId: string,
    @Req() req: Request | any,
  ): Promise<Order> {
    return await this.ordersService.updateOrder(
      updateOrderDto,
      req.user.id,
      orderId,
    );
  }
}
