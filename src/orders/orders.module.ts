import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineItem } from './entities/lineItem.entity';
import { Order } from './entities/order.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './orders.controller';
import { ThirdPartyModule } from 'src/third-party/third-party.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, LineItem]),
    UsersModule,
    ProductsModule,
    ThirdPartyModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
