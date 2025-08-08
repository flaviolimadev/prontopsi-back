import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { NotificationType, NotificationStatus } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  actionUrl?: string;
}

export class UpdateNotificationDto {
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsString()
  @IsOptional()
  actionUrl?: string;
}

export class NotificationResponseDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata?: any;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
