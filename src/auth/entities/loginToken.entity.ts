import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Entity,
} from 'typeorm';

@Entity()
export class LoginToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
