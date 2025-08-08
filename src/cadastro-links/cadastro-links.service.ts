import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CadastroLink, CadastroStatus } from '../entities/cadastro-link.entity';
import { CadastroSubmission } from '../entities/cadastro-link.entity';
import { CreateCadastroLinkDto, UpdateCadastroLinkDto, CreateCadastroSubmissionDto, UpdateCadastroSubmissionDto } from '../dto/cadastro-link.dto';
import { Paciente } from '../entities/paciente.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { CreatePacienteDto } from '../dto/paciente.dto';
import { CreateAgendaSessaoDto } from '../dto/agenda-sessao.dto';
import { PacientesService } from '../pacientes/pacientes.service';
import { AgendaSessoesService } from '../agenda-sessoes/agenda-sessoes.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CadastroLinksService {
  constructor(
    @InjectRepository(CadastroLink)
    private cadastroLinkRepository: Repository<CadastroLink>,
    @InjectRepository(CadastroSubmission)
    private cadastroSubmissionRepository: Repository<CadastroSubmission>,
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,
    @InjectRepository(AgendaSessao)
    private agendaSessaoRepository: Repository<AgendaSessao>,
    private pacientesService: PacientesService,
    private agendaSessoesService: AgendaSessoesService,
    private notificationsService: NotificationsService,
  ) {}

  async createLink(createDto: CreateCadastroLinkDto): Promise<CadastroLink> {
    const link = this.cadastroLinkRepository.create({
      ...createDto,
      token: this.generateToken(),
      currentUses: 0,
      isActive: true,
    });

    return await this.cadastroLinkRepository.save(link);
  }

  async updateLink(id: string, updateDto: UpdateCadastroLinkDto): Promise<CadastroLink> {
    const link = await this.cadastroLinkRepository.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }

    Object.assign(link, updateDto);
    return await this.cadastroLinkRepository.save(link);
  }

  async deleteLink(id: string): Promise<void> {
    const link = await this.cadastroLinkRepository.findOne({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }

    await this.cadastroLinkRepository.remove(link);
  }

  async getLinksByUser(userId: string): Promise<CadastroLink[]> {
    return await this.cadastroLinkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPublicCadastroLink(token: string): Promise<CadastroLink> {
    const link = await this.cadastroLinkRepository.findOne({
      where: { token, isActive: true },
    });

    if (!link) {
      throw new NotFoundException('Link não encontrado ou inativo.');
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new BadRequestException('Link expirado.');
    }

    if (link.maxUses > 0 && link.currentUses >= link.maxUses) {
      throw new BadRequestException('Limite de usos atingido.');
    }

    return link;
  }

  async submitCadastro(token: string, submissionData: CreateCadastroSubmissionDto): Promise<CadastroSubmission> {
    const link = await this.getPublicCadastroLink(token);

    const submission = this.cadastroSubmissionRepository.create({
      cadastroLinkId: link.id,
      pacienteData: submissionData,
      status: CadastroStatus.PENDING,
    });

    const savedSubmission = await this.cadastroSubmissionRepository.save(submission);

    // Incrementar o contador de usos
    link.currentUses += 1;
    await this.cadastroLinkRepository.save(link);

    // Criar notificação para o psicólogo
    await this.notificationsService.createCadastroRequestNotification(
      link.userId,
      submissionData.nome
    );

    return savedSubmission;
  }

  async getSubmissionsByUser(userId: string): Promise<CadastroSubmission[]> {
    return await this.cadastroSubmissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.cadastroLink', 'link')
      .where('link.userId = :userId', { userId })
      .orderBy('submission.createdAt', 'DESC')
      .getMany();
  }

  async approveSubmission(id: string, updateDto: UpdateCadastroSubmissionDto): Promise<CadastroSubmission> {
    const submission = await this.cadastroSubmissionRepository.findOne({
      where: { id },
      relations: ['cadastroLink'],
    });

    if (!submission) {
      throw new NotFoundException(`Submissão com ID ${id} não encontrada.`);
    }

    if (submission.status !== CadastroStatus.PENDING) {
      throw new BadRequestException('Submissão já foi processada.');
    }

    const userId = submission.cadastroLink.userId;
    let pacienteId: string;

    // Se um pacienteId foi fornecido, usar ele; senão criar novo paciente
    if (updateDto.pacienteId) {
      pacienteId = updateDto.pacienteId;
    } else {
      // Criar paciente
      const pacienteData: CreatePacienteDto = {
        ...submission.pacienteData,
        status: 1, // Ativo
      };

      const paciente = this.pacienteRepository.create({
        ...pacienteData,
        userId,
      });

      const savedPaciente = await this.pacienteRepository.save(paciente);
      pacienteId = savedPaciente.id;
    }

    // Atualizar submissão
    submission.status = CadastroStatus.APPROVED;
    submission.approvedPacienteId = pacienteId;

    // Tratar observacoes opcional
    if (updateDto.observacoes !== undefined) {
      submission.observacoes = updateDto.observacoes;
    }

    const savedSubmission = await this.cadastroSubmissionRepository.save(submission);

    return savedSubmission;
  }

  async rejectSubmission(id: string, updateDto: UpdateCadastroSubmissionDto): Promise<CadastroSubmission> {
    const submission = await this.cadastroSubmissionRepository.findOne({
      where: { id },
      relations: ['cadastroLink'],
    });

    if (!submission) {
      throw new NotFoundException(`Submissão com ID ${id} não encontrada.`);
    }

    if (submission.status !== CadastroStatus.PENDING) {
      throw new BadRequestException('Submissão já foi processada.');
    }

    submission.status = CadastroStatus.REJECTED;

    // Tratar observacoes opcional
    if (updateDto.observacoes !== undefined) {
      submission.observacoes = updateDto.observacoes;
    }

    return await this.cadastroSubmissionRepository.save(submission);
  }

  generateToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  generatePublicUrl(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    return `${baseUrl}/#/cadastro/${token}`;
  }
}
