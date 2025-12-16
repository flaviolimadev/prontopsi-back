import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PacotesService } from './pacotes.service';
import { CreatePacoteDto, UpdatePacoteDto } from '../dto/pacote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pacotes')
export class PacotesController {
  constructor(private readonly pacotesService: PacotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createPacoteDto: CreatePacoteDto) {
    return this.pacotesService.create(req.user.sub, createPacoteDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.pacotesService.findAll(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      ativo !== undefined ? ativo === 'true' : undefined,
    );
  }

  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req) {
    return this.pacotesService.getStatistics(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pacotesService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePacoteDto: UpdatePacoteDto,
  ) {
    return this.pacotesService.update(req.user.sub, id, updatePacoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    return this.pacotesService.remove(req.user.sub, id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Request() req, @Param('id') id: string) {
    return this.pacotesService.deactivate(req.user.sub, id);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  async activate(@Request() req, @Param('id') id: string) {
    return this.pacotesService.activate(req.user.sub, id);
  }
} 