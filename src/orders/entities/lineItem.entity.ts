import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class LineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  // Relations
  @ManyToOne(() => Order, (order) => order.lineItems)
  public order: Order;

  @ManyToOne(() => Product, (product) => product.lineItems)
  public product: Product;
}
