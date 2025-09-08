import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Estatísticas gerais do sistema
  @Get('stats')
  async getStats() {
    return this.adminService.getSystemStats();
  }

  // Listar todos os usuários com paginação e filtros
  @Get('users')
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: number,
    @Query('isAdmin') isAdmin?: boolean,
  ) {
    return this.adminService.getUsers(page, limit, search, status, isAdmin);
  }

  // Estatísticas detalhadas de usuários (DEVE VIR ANTES de users/:id)
  @Get('users/detailed-stats')
  async getUserDetailedStats() {
    console.log('🔍 AdminController: getUserDetailedStats chamado');
    const result = await this.adminService.getUserDetailedStats();
    console.log('🔍 AdminController: Retornando resultado:', result);
    return result;
  }


  // Estatísticas de usuários
  @Get('users/stats')
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  // Obter detalhes de um usuário específico
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  // Atualizar usuário (incluindo status de admin)
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateUser(id, updateData);
  }

  // Ativar/Desativar usuário
  @Put('users/:id/status')
  @HttpCode(HttpStatus.OK)
  async toggleUserStatus(@Param('id') id: string, @Body() body: { status: number }) {
    return this.adminService.toggleUserStatus(id, body.status);
  }

  // Tornar usuário admin ou remover privilégios
  @Put('users/:id/admin')
  @HttpCode(HttpStatus.OK)
  async toggleAdminStatus(@Param('id') id: string, @Body() body: { isAdmin: boolean }) {
    return this.adminService.toggleAdminStatus(id, body.isAdmin);
  }

  // Deletar usuário (soft delete)
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Monitoramento do sistema
  @Get('system/health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  // Logs do sistema
  @Get('system/logs')
  async getSystemLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('level') level?: string,
  ) {
    return this.adminService.getSystemLogs(page, limit, level);
  }

  // Analytics de rotas
  @Get('analytics/routes')
  async getRouteAnalytics() {
    return this.adminService.getRouteAnalytics();
  }

  // Analytics de usuários por rota
  @Get('analytics/users-routes')
  async getUserRouteAnalytics() {
    return this.adminService.getUserRouteAnalytics();
  }
}

