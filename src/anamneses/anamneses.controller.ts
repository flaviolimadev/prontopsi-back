import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnamnesesService, UpsertAnamneseDto } from './anamneses.service';

@Controller('anamneses')
export class AnamnesesController {
  constructor(private readonly anamnesesService: AnamnesesService) {}

  @Get(':pacienteId')
  @UseGuards(JwtAuthGuard)
  async getByPaciente(@Request() req, @Param('pacienteId') pacienteId: string) {
    return this.anamnesesService.getByPaciente(req.user.sub, pacienteId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async upsert(@Request() req, @Body() body: UpsertAnamneseDto) {
    return this.anamnesesService.upsert(req.user.sub, body);
  }
}


