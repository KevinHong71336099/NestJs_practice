import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NodemailerService } from '../services/nodemailer.service';
import { SendingTaskObj } from '../dtos/sendingTaskObj.dto';

@Processor('nodemailer')
export class NodemailerConsumer extends WorkerHost {
  constructor(private nodeMailerService: NodemailerService) {
    super();
  }
  async process(job: Job<SendingTaskObj>): Promise<any> {
    const { userEmail, userName, orderId } = job.data;
    try {
      await this.nodeMailerService.sendingEmail({
        userEmail,
        userName,
        orderId,
      });
      console.log('Email sent successfully');
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  }
}
