import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  // GET /automation-test
  // Endpoint de teste direto no AppController
  @Get('automation-test')
  automationTest() {
    return {
      success: true,
      message: 'Teste de automação funcionando no AppController!',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /automation-api-test
  // Endpoint de teste com prefixo automation-api
  @Get('automation-api-test')
  automationApiTest() {
    return {
      success: true,
      message: 'Teste com prefixo automation-api funcionando!',
      timestamp: new Date().toISOString(),
    };
  }
}
