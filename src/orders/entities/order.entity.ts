import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { LineItem } from "./lineItem.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    financialStatus: string

    @Column()
    fulfillmentStatus: string

    @Column()
    note: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.adminOrders, { cascade: true })
    admin: User

    @ManyToOne(() => User, (user) => user.guestOrders, { cascade: true })
    guest: User

    @OneToMany(() => LineItem, (lineItem) => lineItem.order)
    public lineItems: LineItem[]

}