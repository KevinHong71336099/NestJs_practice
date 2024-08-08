import { IsNotEmpty, IsString } from 'class-validator';

export class SendingTaskObj {
  @IsString()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;
}
