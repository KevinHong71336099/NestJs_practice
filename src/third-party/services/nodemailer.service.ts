import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SendingTaskObj } from '../dtos/sendingTaskObj.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  private transporter: nodemailer.Transporter;
  constructor(
    @InjectQueue('nodemailer') private nodemailerQueue: Queue,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASS'),
      },
    });
  }

  async addSendingTask(sendingTaskObj: SendingTaskObj) {
    await this.nodemailerQueue.add('sendEmail', sendingTaskObj, {
      delay: 2000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async sendingEmail(sendingTaskObj: SendingTaskObj) {
    await this.transporter.sendMail({
      from: this.configService.get('GMAIL_USER'),
      to: sendingTaskObj.userEmail,
      subject: `XXX商店感謝${sendingTaskObj.userName}的消費，訂單編號:${sendingTaskObj.orderId}已下訂`,
      text: '歡迎再次消費',
    });
  }
}
