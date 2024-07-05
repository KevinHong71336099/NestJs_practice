import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Get,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dtos/createOrder.dto';
import { OrdersService } from './orders.service';
import { Request } from 'express';
import { UpdateOrderDto } from './dtos/updateOrder.dto';
import { FindOrderQuery } from './dtos/findOrderQuery.dto';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get(':id')
  async findOrderById(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.findOrderById(id);
  }

  @Get()
  async findOrderByQuery(@Query() query: FindOrderQuery): Promise<Order[]> {
    return await this.ordersService.findOrderByQuery(query);
  }

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

  @Delete(':id')
  async deleteOrder(@Param('id') id: string): Promise<Order> {
    return await this.ordersService.deleteOrder(id);
  }
}
