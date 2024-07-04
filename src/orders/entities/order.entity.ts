import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LineItem } from './lineItem.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  financialStatus: string;

  @Column()
  fulfillmentStatus: string;

  @Column()
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.adminOrders)
  admin: User;

  @ManyToOne(() => User, (user) => user.guestOrders)
  guest: User;

  @OneToMany(() => LineItem, (lineItem) => lineItem.order, { cascade: true })
  public lineItems: LineItem[];
}
