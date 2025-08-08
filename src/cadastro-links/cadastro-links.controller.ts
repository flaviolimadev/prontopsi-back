import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CadastroLinksService } from './cadastro-links.service';
import { CreateCadastroLinkDto, UpdateCadastroLinkDto, CreateCadastroSubmissionDto, UpdateCadastroSubmissionDto } from '../dto/cadastro-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cadastro-links')
export class CadastroLinksController {
  constructor(private readonly cadastroLinksService: CadastroLinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async createLink(@Body() createDto: CreateCadastroLinkDto, @Request() req) {
    const link = await this.cadastroLinksService.createLink({
      ...createDto,
      userId: req.user.sub,
    } as any);
    return link;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getLinksByUser(@Request() req) {
    const links = await this.cadastroLinksService.getLinksByUser(req.user.sub);
    return links;
  }

  @Get('submissions/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getSubmissionsByUser(@Request() req) {
    return await this.cadastroLinksService.getSubmissionsByUser(req.user.sub);
  }

  @Get('submissions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getSubmissionById(@Param('id') id: string, @Request() req) {
    const submissions = await this.cadastroLinksService.getSubmissionsByUser(req.user.sub);
    const submission = submissions.find(s => s.id === id);
    if (!submission) {
      throw new Error('Submissão não encontrada');
    }
    return submission;
  }

  @Put('submissions/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async approveSubmission(@Param('id') id: string, @Body() updateDto: UpdateCadastroSubmissionDto, @Request() req) {
    return await this.cadastroLinksService.approveSubmission(id, updateDto);
  }

  @Put('submissions/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async rejectSubmission(@Param('id') id: string, @Body() updateDto: UpdateCadastroSubmissionDto, @Request() req) {
    return await this.cadastroLinksService.rejectSubmission(id, updateDto);
  }

  @Get('public/:token')
  async getPublicCadastroLink(@Param('token') token: string) {
    const link = await this.cadastroLinksService.getPublicCadastroLink(token);
    return link;
  }

  @Post('public/submit')
  async submitCadastro(@Body() createDto: CreateCadastroSubmissionDto) {
    return await this.cadastroLinksService.submitCadastro(createDto.token, createDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async getLinkById(@Param('id') id: string, @Request() req) {
    const link = await this.cadastroLinksService.getLinksByUser(req.user.sub);
    const foundLink = link.find(l => l.id === id);
    if (!foundLink) {
      throw new Error('Link não encontrado');
    }
    return foundLink;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async updateLink(@Param('id') id: string, @Body() updateDto: UpdateCadastroLinkDto, @Request() req) {
    const link = await this.cadastroLinksService.updateLink(id, updateDto);
    return link;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async deleteLink(@Param('id') id: string, @Request() req) {
    await this.cadastroLinksService.deleteLink(id);
    return { message: 'Link deletado com sucesso' };
  }

}
