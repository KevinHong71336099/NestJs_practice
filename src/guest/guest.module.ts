import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/products/products.module';
import { GuestController } from './guest.controller';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [GuestController],
})
export class GuestModule {}
