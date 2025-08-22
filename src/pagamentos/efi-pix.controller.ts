import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpStatus, 
  HttpException,
  Request
} from '@nestjs/common';
import { EfiPixService } from './efi-pix.service';
import { PixTransactionRepository } from './pix-transaction.repository';
import { 
  CreatePixChargeDto, 
  SendPixDto, 
  RefundPixDto, 
  QueryPixDto,
  PixChargeResponseDto,
  PixReceivedResponseDto,
  PixSentResponseDto
} from '../dto/pix.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
// Enum de roles para controle de acesso
enum UserRole {
  ADMIN = 'ADMIN',
  PSYCHOLOGIST = 'PSYCHOLOGIST'
}
import { PixTransactionStatus, PixTransactionType } from '../entities/pix-transaction.entity';

@Controller('pix')
export class EfiPixController {
  constructor(
    private readonly efiPixService: EfiPixService,
    private readonly pixTransactionRepository: PixTransactionRepository,
  ) {}

  /**
   * ROTA DE TESTE SEM AUTENTICAÇÃO - Gera dados de pagamento Pix reais ou simulados
   * POST /api/pix/teste-publico
   */
  @Post('teste-publico')
  async gerarPixTestePublico(
    @Body() data: {
      valor: number;
      descricao: string;
      nomePagador?: string;
      cpfPagador?: string;
      emailPagador?: string;
    }
  ) {
    try {
      // Log para debug
      console.log('🔍 Dados recebidos na rota pública:', JSON.stringify(data, null, 2));
      console.log('💰 Valor recebido:', data.valor, 'Tipo:', typeof data.valor);
      
      // Validação adicional
      if (!data.valor || data.valor <= 0) {
        throw new HttpException(
          'Valor deve ser um número maior que zero',
          HttpStatus.BAD_REQUEST
        );
      }

      // Tentar criar Pix real primeiro
      try {
        console.log('🚀 Tentando criar Pix real via Gerencianet...');
        const realPixResult = await this.efiPixService.createPixCharge(data);
        
        if (realPixResult.success) {
          console.log('✅ Pix real criado com sucesso!');
          return realPixResult;
        } else {
          console.log('⚠️ Falha ao criar Pix real, usando simulação:', realPixResult.message);
        }
      } catch (realPixError) {
        console.log('⚠️ Erro ao criar Pix real, usando simulação:', realPixError.message);
      }

      // Fallback: Gerar dados simulados com estrutura real
      console.log('🔄 Usando simulação como fallback...');
      
      const txid = `txid_simulado_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 1);

      // Criar transação simulada no banco
      const transaction = await this.pixTransactionRepository.create({
        txid,
        type: PixTransactionType.CHARGE,
        status: PixTransactionStatus.PENDING,
        valor: data.valor,
        chave: 'prontupsi@gerencianet.com.br',
        descricao: data.descricao,
        qrcode: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${(data.valor / 100).toFixed(2)}5802BR5913ProntuPsi6009Brasilia62070503***6304`,
        qrcodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014br.gov.bcb.pix0136${txid}520400005303986540${(data.valor / 100).toFixed(2)}5802BR5913ProntuPsi6009Brasilia62070503***6304`,
        devedor: {
          nome: data.nomePagador || 'Pagador',
          cpf: data.cpfPagador || '00000000000',
          email: data.emailPagador
        },
        expiredAt,
        metadata: {
          sessionId: `session_${Date.now()}`,
          paymentMethod: 'PIX',
          notes: 'Transação SIMULADA - estrutura real do Gerencianet',
          isTest: true,
          isPublicTest: true,
          integrationType: 'simulacao-fallback'
        },
        userId: 'public-test',
        pacienteId: undefined,
        efipayResponse: {
          txid,
          status: 'ATIVA',
          calendario: {
            criacao: new Date().toISOString(),
            expiracao: 3600
          },
          valor: {
            original: (data.valor / 100).toFixed(2)
          },
          chave: 'prontupsi@gerencianet.com.br',
          solicitacaoPagador: data.descricao,
          qrcode: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540${(data.valor / 100).toFixed(2)}5802BR5913ProntuPsi6009Brasilia62070503***6304`
        }
      });

      // Retornar dados simulados
      return {
        success: true,
        message: 'Pix SIMULADO criado (API real indisponível)',
        data: {
          txid: transaction.txid,
          valor: transaction.getFormattedValue(),
          descricao: transaction.descricao,
          qrcode: transaction.qrcode,
          qrcodeImage: transaction.qrcodeImage,
          devedor: transaction.devedor,
          expiredAt: transaction.expiredAt,
          status: transaction.status,
          databaseId: transaction.id,
          isTest: true,
          isReal: false,
          isPublicTest: true,
          sdkVersion: '1.2.25',
          integrationType: 'simulacao-fallback',
          instructions: [
            '⚠️ Pix SIMULADO - API real indisponível',
            'QR Code funcional para testes',
            'Estrutura idêntica ao real',
            'Para demonstrações e testes'
          ]
        }
      };

    } catch (error) {
      console.error('❌ Erro ao gerar Pix:', error.message);
      throw new HttpException(
        `Erro ao gerar Pix: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ROTA DE TESTE - Gera dados de pagamento Pix simulados
   * POST /api/pix/teste-gerar-pix
   */
  @Post('teste-gerar-pix')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async gerarPixTeste(
    @Body() data: {
      valor: number;
      descricao: string;
      nomePagador?: string;
      cpfPagador?: string;
      emailPagador?: string;
      pacienteId?: string;
    },
    @Request() req: any
  ) {
    try {
      // Gerar TXID único para teste
      const txid = `txid_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calcular data de expiração (1 hora)
      const expiredAt = new Date();
      expiredAt.setHours(expiredAt.getHours() + 1);

      // Criar transação de teste no banco
      const transaction = await this.pixTransactionRepository.create({
        txid,
        type: PixTransactionType.CHARGE,
        status: PixTransactionStatus.PENDING,
        valor: data.valor,
        chave: 'teste@prontupsi.com',
        descricao: data.descricao,
        qrcode: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540510.005802BR5913ProntuPsi Test6009Brasilia62070503***6304`,
        qrcodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${txid}`,
        devedor: {
          nome: data.nomePagador || 'Paciente Teste',
          cpf: data.cpfPagador || '12345678901',
          email: data.emailPagador || 'paciente@teste.com'
        },
        expiredAt,
        metadata: {
          sessionId: `session_${Date.now()}`,
          paymentMethod: 'PIX',
          notes: 'Transação de teste - ambiente de desenvolvimento',
          isTest: true
        },
        userId: req.user.id,
        pacienteId: data.pacienteId,
        efipayResponse: {
          txid,
          status: 'ATIVA',
          calendario: {
            criacao: new Date().toISOString(),
            expiracao: 3600
          },
          valor: {
            original: (data.valor / 100).toFixed(2)
          },
          chave: 'teste@prontupsi.com',
          solicitacaoPagador: data.descricao,
          qrcode: `00020126580014br.gov.bcb.pix0136${txid}520400005303986540510.005802BR5913ProntuPsi Test6009Brasilia62070503***6304`
        }
      });

      // Retornar dados simulados
      return {
        success: true,
        message: 'Pix de teste gerado com sucesso!',
        data: {
          txid: transaction.txid,
          valor: transaction.getFormattedValue(),
          descricao: transaction.descricao,
          qrcode: transaction.qrcode,
          qrcodeImage: transaction.qrcodeImage,
          devedor: transaction.devedor,
          expiredAt: transaction.expiredAt,
          status: transaction.status,
          databaseId: transaction.id,
          isTest: true,
          instructions: [
            'Este é um Pix de TESTE - não será processado pela Efí',
            'Use o QR Code para simular o pagamento',
            'O status será atualizado manualmente para simular o fluxo completo'
          ]
        }
      };

    } catch (error) {
      throw new HttpException(
        `Erro ao gerar Pix de teste: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ROTA DE TESTE - Simula pagamento de um Pix
   * POST /api/pix/teste-simular-pagamento/:txid
   */
  @Post('teste-simular-pagamento/:txid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async simularPagamentoPix(
    @Param('txid') txid: string,
    @Request() req: any
  ) {
    try {
      // Buscar transação no banco
      const transaction = await this.pixTransactionRepository.findByTxid(txid);
      
      if (!transaction) {
        throw new HttpException('Transação não encontrada', HttpStatus.NOT_FOUND);
      }

      if (transaction.status !== PixTransactionStatus.PENDING) {
        throw new HttpException('Transação não está pendente', HttpStatus.BAD_REQUEST);
      }

      // Simular pagamento (atualizar status para PAID)
      await this.pixTransactionRepository.updateStatus(
        transaction.id,
        PixTransactionStatus.PAID,
        { paidAt: new Date() }
      );

      // Buscar transação atualizada
      const updatedTransaction = await this.pixTransactionRepository.findById(transaction.id);

      if (!updatedTransaction) {
        throw new HttpException('Erro ao buscar transação atualizada', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        message: 'Pagamento Pix simulado com sucesso!',
        data: {
          txid: updatedTransaction.txid,
          valor: updatedTransaction.getFormattedValue(),
          status: updatedTransaction.status,
          paidAt: updatedTransaction.paidAt,
          isTest: true,
          message: 'Este pagamento foi simulado para fins de teste'
        }
      };

    } catch (error) {
      throw new HttpException(
        `Erro ao simular pagamento: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ROTA DE TESTE - Lista todos os Pixes de teste
   * GET /api/pix/teste-listar
   */
  @Get('teste-listar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async listarPixesTeste(@Request() req: any) {
    try {
      // Buscar transações de teste do usuário
      const transactions = await this.pixTransactionRepository.findByUser(req.user.id, 100);
      
      // Filtrar apenas transações de teste
      const pixesTeste = transactions.filter(t => 
        t.metadata?.isTest === true
      );

      return {
        success: true,
        message: `${pixesTeste.length} Pixes de teste encontrados`,
        data: pixesTeste.map(pix => ({
          id: pix.id,
          txid: pix.txid,
          valor: pix.getFormattedValue(),
          descricao: pix.descricao,
          status: pix.status,
          createdAt: pix.createdAt,
          expiredAt: pix.expiredAt,
          paidAt: pix.paidAt,
          devedor: pix.devedor,
          isExpired: pix.isExpired(),
          daysUntilExpiration: pix.getDaysUntilExpiration()
        }))
      };

    } catch (error) {
      throw new HttpException(
        `Erro ao listar Pixes de teste: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * ROTA DE TESTE - Limpa todos os Pixes de teste
   * DELETE /api/pix/teste-limpar
   */
  @Post('teste-limpar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async limparPixesTeste(@Request() req: any) {
    try {
      // Buscar transações de teste do usuário
      const transactions = await this.pixTransactionRepository.findByUser(req.user.id, 1000);
      
      // Filtrar apenas transações de teste
      const pixesTeste = transactions.filter(t => 
        t.metadata?.isTest === true
      );

      // Deletar transações de teste
      let deletedCount = 0;
      for (const pix of pixesTeste) {
        const deleted = await this.pixTransactionRepository.delete(pix.id);
        if (deleted) deletedCount++;
      }

      return {
        success: true,
        message: `${deletedCount} Pixes de teste removidos com sucesso`,
        data: {
          deletedCount,
          totalTestPixes: pixesTeste.length
        }
      };

    } catch (error) {
      throw new HttpException(
        `Erro ao limpar Pixes de teste: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cria uma cobrança Pix
   * POST /api/pix/cobranca
   */
  @Post('cobranca')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async createPixCharge(
    @Body() createPixChargeDto: CreatePixChargeDto,
    @Request() req: any
  ) {
    try {
      const result = await this.efiPixService.createPixCharge(createPixChargeDto);
      
      if (!result.success) {
        throw new HttpException(
          result.message || 'Erro ao criar cobrança Pix',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro ao criar cobrança Pix: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Consulta uma cobrança Pix pelo txid
   * GET /api/pix/cobranca/:txid
   */
  @Get('cobranca/:txid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getPixCharge(@Param('txid') txid: string): Promise<PixChargeResponseDto> {
    try {
      const result = await this.efiPixService.getPixCharge(txid);
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar cobrança Pix: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Consulta Pix recebidos
   * GET /api/pix/recebidos
   */
  @Get('recebidos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getReceivedPix(@Query() queryPixDto: QueryPixDto): Promise<{
    pix: PixReceivedResponseDto[];
    total: number;
    paginaAtual: number;
    itensPorPagina: number;
  }> {
    try {
      const result = await this.efiPixService.getReceivedPix(queryPixDto);
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro ao consultar Pix recebidos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Envia Pix para uma chave
   * POST /api/pix/enviar
   */
  @Post('enviar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async sendPix(@Body() sendPixDto: SendPixDto): Promise<PixSentResponseDto> {
    try {
      const result = await this.efiPixService.sendPix(sendPixDto);
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro ao enviar Pix: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Devolve um Pix recebido
   * PUT /api/pix/devolver/:e2eId
   */
  @Put('devolver/:e2eId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async refundPix(
    @Param('e2eId') e2eId: string,
    @Body() refundPixDto: RefundPixDto
  ): Promise<{ id: string; status: string }> {
    try {
      const result = await this.efiPixService.refundPix(
        e2eId,
        refundPixDto.valor,
        refundPixDto.descricao
      );
      return { id: result.id, status: 'Devolução solicitada com sucesso' };
    } catch (error) {
      throw new HttpException(
        `Erro ao devolver Pix: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Gera QR Code para uma cobrança Pix
   * GET /api/pix/qrcode/:txid
   */
  @Get('qrcode/:txid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async generateQrCode(@Param('txid') txid: string): Promise<{
    qrcode: string;
    qrcodeImage: string;
  }> {
    try {
      const cobranca = await this.efiPixService.getPixCharge(txid);
      
      if (!cobranca.qrcode) {
        throw new Error('QR Code não disponível para esta cobrança');
      }

      return {
        qrcode: cobranca.qrcode,
        qrcodeImage: cobranca.qrcodeImage || ''
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao gerar QR Code: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Status da API Efí
   * GET /api/pix/status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getApiStatus(): Promise<{
    status: string;
    timestamp: string;
    message: string;
  }> {
    try {
      // Tenta obter um token para verificar se a API está funcionando
      await this.efiPixService['getAccessToken']();
      
      return {
        status: 'online',
        timestamp: new Date().toISOString(),
        message: 'API Efí Pix funcionando normalmente'
      };
    } catch (error) {
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
        message: `API Efí Pix indisponível: ${error.message}`
      };
    }
  }

  /**
   * TESTE PÚBLICO - Status da API Efí (sem autenticação)
   * GET /api/pix/status-publico
   */
  @Get('status-publico')
  async getApiStatusPublico(): Promise<{
    status: string;
    timestamp: string;
    message: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Testando conexão com Gerencianet...');
      
      // Usar o novo método do serviço
      const status = await this.efiPixService.checkStatus();
      
      console.log('✅ Status da API:', status.status);
      
      return {
        status: status.status,
        timestamp: status.details?.timestamp || new Date().toISOString(),
        message: status.message,
        details: status.details
      };
    } catch (error) {
      console.error('❌ Erro na conexão:', error.message);
      return {
        status: 'offline',
        timestamp: new Date().toISOString(),
        message: `API Gerencianet indisponível: ${error.message}`,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Lista transações Pix do usuário
   * GET /api/pix/transacoes
   */
  @Get('transacoes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getTransactions(
    @Query() query: any,
    @Request() req: any
  ) {
    try {
      const filters = {
        userId: req.user.id,
        status: query.status,
        type: query.type,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        search: query.search,
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0,
      };

      const result = await this.pixTransactionRepository.findWithFilters(filters);
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar transações: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtém estatísticas das transações
   * GET /api/pix/estatisticas
   */
  @Get('estatisticas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async getStats(@Request() req: any) {
    try {
      const stats = await this.efiPixService.getTransactionStats(req.user.id);
      return stats;
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar estatísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Sincroniza transações pendentes
   * POST /api/pix/sincronizar
   */
  @Post('sincronizar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async syncTransactions() {
    try {
      const result = await this.efiPixService.syncPixTransactions();
      return result;
    } catch (error) {
      throw new HttpException(
        `Erro na sincronização: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Webhook para notificações da Efí
   * POST /api/pix/webhook
   */
  @Post('webhook')
  async processWebhook(@Body() webhookData: any) {
    try {
      await this.efiPixService.processWebhook(webhookData);
      return { message: 'Webhook processado com sucesso' };
    } catch (error) {
      // this.logger.error('Erro ao processar webhook:', error.message); // Original code had this line commented out
      throw new HttpException(
        `Erro ao processar webhook: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Marca transações expiradas
   * POST /api/pix/expirar
   */
  @Post('expirar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PSYCHOLOGIST)
  async markExpiredTransactions() {
    try {
      const count = await this.efiPixService.markExpiredTransactions();
      return {
        message: `${count} transações marcadas como expiradas`,
        count
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao marcar transações expiradas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
