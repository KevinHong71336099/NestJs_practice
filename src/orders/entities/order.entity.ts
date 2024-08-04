import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @Column({ nullable: true, default: 'defaultStatus' })
  financialStatus: string;

  @Column({ nullable: true, default: 'defaultStatus' })
  fulfillmentStatus: string;

  @Column()
  note: string;

  @Column()
  adminId: string;

  @Column()
  guestId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.adminOrders)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @ManyToOne(() => User, (user) => user.guestOrders)
  @JoinColumn({ name: 'guestId' })
  guest: User;

  @OneToMany(() => LineItem, (lineItem) => lineItem.order, { cascade: true })
  public lineItems: LineItem[];
}
