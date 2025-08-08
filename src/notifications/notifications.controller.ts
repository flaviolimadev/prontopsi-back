import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from '../dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getUserNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(req.user.sub);
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getUnreadNotifications(@Request() req) {
    return this.notificationsService.getUnreadNotifications(req.user.sub);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getUnreadCount(@Request() req) {
    return { count: await this.notificationsService.getUnreadCount(req.user.sub) };
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Put('mark-all-read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async updateNotification(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
    @Request() req
  ) {
    return this.notificationsService.updateNotification(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationsService.deleteNotification(id, req.user.sub);
    return { message: 'Notificação deletada com sucesso' };
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteAllNotifications(@Request() req) {
    await this.notificationsService.deleteAllNotifications(req.user.sub);
    return { message: 'Todas as notificações foram deletadas' };
  }

  // Endpoints para administradores criarem notificações
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createNotification(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createDto);
  }

  @Post('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createSystemNotification(
    @Body() body: { userId: string; title: string; message: string; type?: string; actionUrl?: string }
  ) {
    return this.notificationsService.createSystemNotification(
      body.userId,
      body.title,
      body.message,
      body.type as any,
      body.actionUrl
    );
  }
}
