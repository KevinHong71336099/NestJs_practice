import { Module } from '@nestjs/common';
import { NodemailerService } from './services/nodemailer.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { NodemailerConsumer } from './processors/nodemailer.consumer';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        port: 6379,
        host: 'localhost',
      },
    }),
    BullModule.registerQueue({
      name: 'nodemailer',
    }),
    ConfigModule.forRoot(),
  ],
  providers: [NodemailerService, NodemailerConsumer],
  exports: [NodemailerService],
})
export class ThirdPartyModule {}
