import { LineItem } from 'src/orders/entities/lineItem.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  costPrice: number;

  @Column()
  sellPrice: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  stockQuantity: number;

  @Column()
  productStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => LineItem, (lineItem) => lineItem.product)
  public lineItems: LineItem[]
}
