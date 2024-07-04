import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService],
  controllers: [OrdersModule],
})
export class OrdersModule {}
