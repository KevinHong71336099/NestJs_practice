import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailInfos } from 'src/orders/dtos/emailInfos.dto';
import { NodemailerService } from 'src/third-party/services/nodemailer.service';

@Injectable()
export class EmailListener {
  constructor(private readonly nodemailerService: NodemailerService) {}

  @OnEvent('email.sending')
  async handleEmailSendingEvent(emailInfos: EmailInfos): Promise<void> {
    // 使用 EmailService 來發送郵件
    await this.nodemailerService.addSendingTask(emailInfos);
  }
}
