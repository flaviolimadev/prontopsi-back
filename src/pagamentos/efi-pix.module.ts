import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EfiPixController } from './efi-pix.controller';
import { EfiPixService } from './efi-pix.service';
import { PixTransactionRepository } from './pix-transaction.repository';
import { PixTransaction } from '../entities/pix-transaction.entity';
import { PixSyncCron } from './pix-sync.cron';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PixTransaction]),
    ScheduleModule.forRoot()
  ],
  controllers: [EfiPixController],
  providers: [EfiPixService, PixTransactionRepository, PixSyncCron],
  exports: [EfiPixService, PixTransactionRepository],
})
export class EfiPixModule {}
