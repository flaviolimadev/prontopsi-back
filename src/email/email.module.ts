import { Module } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
