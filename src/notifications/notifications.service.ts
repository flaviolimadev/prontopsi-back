import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationResponseDto } from '../dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = this.notificationRepository.create({
      ...createDto,
      type: createDto.type || NotificationType.INFO,
      status: NotificationStatus.UNREAD,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    return this.mapToResponseDto(savedNotification);
  }

  async getUserNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return notifications.map(notification => this.mapToResponseDto(notification));
  }

  async getUnreadNotifications(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository.find({
      where: { 
        userId, 
        status: NotificationStatus.UNREAD 
      },
      order: { createdAt: 'DESC' },
    });

    return notifications.map(notification => this.mapToResponseDto(notification));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { 
        userId, 
        status: NotificationStatus.UNREAD 
      },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    notification.status = NotificationStatus.READ;
    const updatedNotification = await this.notificationRepository.save(notification);
    return this.mapToResponseDto(updatedNotification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ }
    );
  }

  async updateNotification(notificationId: string, updateDto: UpdateNotificationDto, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    Object.assign(notification, updateDto);
    const updatedNotification = await this.notificationRepository.save(notification);
    return this.mapToResponseDto(updatedNotification);
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  // Método para criar notificações do sistema
  async createSystemNotification(userId: string, title: string, message: string, type: NotificationType = NotificationType.INFO, actionUrl?: string): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      actionUrl,
    });
  }

  // Método para criar notificações de solicitação de cadastro
  async createCadastroRequestNotification(userId: string, patientName: string): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: 'Nova solicitação de cadastro',
      message: `Você recebeu uma nova solicitação de cadastro de ${patientName}. Acesse a seção de solicitações para revisar.`,
      type: NotificationType.WARNING,
      actionUrl: '/#/pacientes#solicitacoes',
    });
  }

  // Método para criar notificações de agendamento
  async createAppointmentNotification(userId: string, patientName: string, appointmentDate: string): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      title: 'Novo agendamento',
      message: `Consulta agendada com ${patientName} para ${appointmentDate}.`,
      type: NotificationType.SUCCESS,
      actionUrl: '/#/agenda',
    });
  }

  private mapToResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      metadata: notification.metadata,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
