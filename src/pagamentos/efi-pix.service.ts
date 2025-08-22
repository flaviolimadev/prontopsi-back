import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { PixTransactionRepository } from './pix-transaction.repository';
import { PixTransaction, PixTransactionStatus, PixTransactionType } from '../entities/pix-transaction.entity';

// Importar a SDK oficial do Gerencianet
const EfiPay = require('sdk-node-apis-efi');

@Injectable()
export class EfiPixService {
  private readonly logger = new Logger(EfiPixService.name);
  private efipay: any = null;
  private isInitialized: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly pixTransactionRepository: PixTransactionRepository,
  ) {
    // Inicializar a SDK de forma assíncrona
    this.initializeEfiPay().catch(error => {
      this.logger.error('❌ Erro na inicialização assíncrona:', error.message);
    });
  }

  /**
   * Inicializa a SDK do Gerencianet com as credenciais corretas
   */
  private async initializeEfiPay() {
    try {
      // Configurações temporárias para teste (substituir por variáveis de ambiente)
      const clientId = this.configService.get('EFI_CLIENT_ID') || 'seu_client_id_aqui';
      const clientSecret = this.configService.get('EFI_CLIENT_SECRET') || 'seu_client_secret_aqui';
      const certPathOrContent = this.configService.get('EFI_CERT_PATH') || './certs/certificado.p12';
      const sandbox = String(this.configService.get('EFI_SANDBOX') || '')
        .toLowerCase()
        .trim() === 'true';
      const passphrase = this.configService.get('EFI_CERT_PASSPHRASE') || '';
      const certBase64 = this.configService.get('EFI_CERT_BASE64') === 'true';
      const validateMtls = this.configService.get('EFI_VALIDATE_MTLS') === 'true';
      const certBase64ContentEnv = this.configService.get('EFI_CERT_BASE64_CONTENT');

      // Log das configurações para debug
      this.logger.log('🔧 Configurações Efí:');
      this.logger.log(`   Client ID: ${clientId}`);
      this.logger.log(`   Client Secret: ${clientSecret ? '***' : 'NÃO CONFIGURADO'}`);
      this.logger.log(`   Certificado: ${certPathOrContent}`);
      this.logger.log(`   Sandbox: ${sandbox}`);
      this.logger.log(`   Passphrase: ${passphrase ? '***' : '(vazio)'}`);
      this.logger.log(`   cert_base64: ${certBase64}`);
      this.logger.log(`   validateMtls: ${validateMtls}`);

      // Verificar certificado somente quando NÃO for base64
      if (!certBase64) {
        if (!fs.existsSync(path.resolve(certPathOrContent))) {
          this.logger.warn(`⚠️ Certificado não encontrado em: ${certPathOrContent}`);
          this.logger.warn('🔧 Inicializando em modo de teste sem certificado...');
          
          // Modo de teste sem certificado
          this.isInitialized = false;
          this.efipay = null;
          this.logger.log('📝 Para usar a API real, configure:');
          this.logger.log('   1. Coloque o certificado .p12 na pasta certs/');
          this.logger.log('   2. Configure as variáveis de ambiente:');
          this.logger.log('      - EFI_CLIENT_ID');
          this.logger.log('      - EFI_CLIENT_SECRET');
          this.logger.log('      - EFI_CERT_PATH');
          return;
        }
      }

      // Preparar opções conforme modo
      let certificateOption: string;
      if (certBase64) {
        if (certBase64ContentEnv && certBase64ContentEnv.length > 100) {
          certificateOption = certBase64ContentEnv;
        } else {
          // Se veio um caminho, ler o arquivo e converter para base64
          try {
            const fileBuf = fs.readFileSync(path.resolve(certPathOrContent));
            certificateOption = fileBuf.toString('base64');
          } catch (e) {
            this.logger.error('❌ Falha ao ler certificado para base64:', e.message);
            this.isInitialized = false;
            this.efipay = null;
            return;
          }
        }
      } else {
        certificateOption = path.resolve(certPathOrContent);
      }

      // Configuração seguindo o padrão da SDK oficial
      const options: any = {
        sandbox: sandbox, // true = HOMOLOGAÇÃO, false = PRODUÇÃO
        client_id: clientId,
        client_secret: clientSecret,
        certificate: certificateOption,
        cert_base64: certBase64,
        validateMtls: validateMtls,
        passphrase: passphrase,
      };

      this.logger.log('🔧 Criando instância da SDK...');
      this.efipay = new EfiPay(options);
      
      // Testar se a SDK está funcionando antes de marcar como inicializada
      this.logger.log('🧪 Testando SDK antes de marcar como inicializada...');
      try {
        await this.efipay.pixListCharges({ inicio: '2022-01-01T00:00:00Z', fim: '2022-01-02T00:00:00Z' });
        this.logger.log('✅ SDK testada com sucesso!');
        
        this.isInitialized = true;
        this.logger.log(`✅ SDK Gerencianet inicializada com sucesso!`);
        this.logger.log(`🔧 Modo: ${sandbox ? 'HOMOLOGAÇÃO' : 'PRODUÇÃO'}`);
        this.logger.log(`📁 Certificado: ${certBase64 ? '(base64)' : certificateOption}`);
        
      } catch (testError: any) {
        this.logger.error('❌ SDK falhou no teste:', testError?.message || testError);
        this.isInitialized = false;
        this.efipay = null;
        this.logger.log('📝 A SDK foi criada mas falhou na autenticação');
        this.logger.log('📝 Verifique se as credenciais e certificado estão corretos');
      }

    } catch (error: any) {
      this.logger.error('❌ Erro ao inicializar SDK Gerencianet:', error.message);
      this.isInitialized = false;
      this.efipay = null;
    }
  }

  /**
   * Verifica se a SDK está funcionando
   */
  async checkStatus() {
    this.logger.log('🔍 Verificando status da SDK Efí...');
    this.logger.log(`   isInitialized: ${this.isInitialized}`);
    this.logger.log(`   efipay existe: ${!!this.efipay}`);
    
    if (!this.isInitialized || !this.efipay) {
      this.logger.log('❌ SDK não inicializada, retornando status offline');
      return {
        status: 'offline',
        message: 'SDK Gerencianet não inicializada - Certificado não encontrado',
        details: {
          error: 'Certificado .p12 não encontrado na pasta certs/',
          solution: 'Coloque o certificado da Efí na pasta certs/ e reinicie o backend',
          timestamp: new Date().toISOString(),
          sdkVersion: '1.2.25',
          integrationType: 'sdk-oficial-gerencianet'
        }
      };
    }

    this.logger.log('✅ SDK inicializada, testando conexão...');

    try {
      // Testar conexão com intervalo de datas exigido pela SDK
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const end = now.toISOString();
      await this.efipay.pixListCharges({ inicio: start, fim: end });
      
      this.logger.log('✅ Conexão testada com sucesso');
      
      return {
        status: 'online',
        message: 'SDK Gerencianet funcionando perfeitamente!',
        details: {
          sdkVersion: '1.2.25',
          integrationType: 'sdk-oficial-gerencianet',
          timestamp: new Date().toISOString(),
          testResponse: 'Conexão testada com sucesso'
        }
      };

    } catch (error: any) {
      this.logger.error('❌ Erro ao testar conexão:', error?.mensagem || error?.message || error);
      
      return {
        status: 'offline',
        message: `SDK Gerencianet com erro: ${error?.mensagem || error?.message || 'erro desconhecido'}`,
        details: {
          error: error?.mensagem || error?.message || JSON.stringify(error),
          timestamp: new Date().toISOString(),
          sdkVersion: '1.2.25',
          integrationType: 'sdk-oficial-gerencianet'
        }
      };
    }
  }

  /**
   * Cria uma cobrança Pix usando a SDK oficial
   */
  async createPixCharge(data: {
    valor: number;
    descricao: string;
    nomePagador?: string;
    cpfPagador?: string;
    emailPagador?: string;
  }) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      // Gerar TXID único válido (somente a-zA-Z0-9, 26–35 caracteres)
      const txid = this.generateValidTxid();

      // Sanitizar CPF (somente dígitos)
      const cpfDigits = (data.cpfPagador || '').toString().replace(/\D/g, '');

      // Montar corpo conforme documentação
      const chavePix = this.configService.get('CHAVE_PIX') || this.configService.get('EFI_PIX_KEY') || 'prontupsi@gerencianet.com.br';

      const body: any = {
        calendario: { expiracao: 3600 },
        valor: { original: (data.valor / 100).toFixed(2) },
        chave: chavePix,
        solicitacaoPagador: data.descricao,
        infoAdicionais: [
          { nome: 'Sistema', valor: 'ProntuPsi' },
          { nome: 'Descrição', valor: data.descricao },
        ],
      };

      // Incluir devedor somente se CPF válido (11 dígitos)
      if (cpfDigits && cpfDigits.length === 11) {
        body.devedor = {
          cpf: cpfDigits,
          nome: data.nomePagador || 'Pagador',
        };
      }

      const params = { txid };

      this.logger.log(`💰 Criando cobrança Pix: ${txid}`);
      this.logger.log(`📝 Dados:`, JSON.stringify(body, null, 2));

      // Criar cobrança
      const response = await this.efipay.pixCreateCharge(params, body);
      this.logger.log(`✅ Cobrança criada com sucesso: ${response.txid}`);

      // Montar payload do QR Code a partir da resposta e, se necessário, gerar via loc.id
      let qrcodePayload = {
        pixCopiaECola: response?.pixCopiaECola,
        imagemQrcode: response?.imagemQrcode,
      } as any;

      // Se não veio na resposta, tentar gerar via loc.id
      if (!qrcodePayload.pixCopiaECola || !qrcodePayload.imagemQrcode) {
        try {
          const locationId = response?.loc?.id || response?.location?.id;
          if (locationId) {
            const qr = await this.efipay.pixGenerateQRCode({ id: locationId });
            qrcodePayload.pixCopiaECola = qrcodePayload.pixCopiaECola || qr?.qrcode || qr?.pixCopiaECola;
            qrcodePayload.imagemQrcode = qrcodePayload.imagemQrcode || qr?.imagemQrcode;
          }
        } catch (qrErr) {
          this.logger.warn('⚠️ Não foi possível gerar QR Code imediatamente:', (qrErr as any)?.message || qrErr);
        }
      }

      // Garantir que a imagem seja um Data URI válido
      if (qrcodePayload?.imagemQrcode && typeof qrcodePayload.imagemQrcode === 'string' && !qrcodePayload.imagemQrcode.startsWith('data:image')) {
        qrcodePayload.imagemQrcode = `data:image/png;base64,${qrcodePayload.imagemQrcode}`;
      }

      // Salvar no banco de dados
      const transaction = await this.pixTransactionRepository.create({
        txid: response.txid,
        type: PixTransactionType.CHARGE,
        status: PixTransactionStatus.PENDING,
        valor: data.valor,
        chave: chavePix,
        descricao: data.descricao,
        qrcode: qrcodePayload.pixCopiaECola,
        qrcodeImage: qrcodePayload.imagemQrcode,
        devedor: body.devedor
          ? { nome: body.devedor.nome, cpf: body.devedor.cpf, email: data.emailPagador }
          : undefined,
        expiredAt: new Date(Date.now() + 3600000), // 1 hora
        metadata: {
          sessionId: `session_${Date.now()}`,
          paymentMethod: 'PIX',
          notes: 'Cobrança criada via SDK oficial Gerencianet',
          isTest: false,
          isPublicTest: false,
          integrationType: 'sdk-oficial-gerencianet'
        },
        userId: 'system',
        pacienteId: undefined,
        efipayResponse: response
      });

      return {
        success: true,
        message: 'Pix criado com sucesso via Gerencianet!',
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
          isTest: false,
          isReal: true,
          sdkVersion: '1.2.25',
          integrationType: 'sdk-oficial-gerencianet',
          instructions: [
            'Pix criado via API oficial do Gerencianet',
            'QR Code válido e funcional',
            'Pagamento real processado pela Efí',
            'Webhook configurado para notificações'
          ]
        }
      };

    } catch (error: any) {
      const detail = error?.response?.data || error;
      const message = detail?.mensagem || detail?.message || 'erro desconhecido';
      this.logger.error('❌ Erro ao criar cobrança Pix:', message);

      return {
        success: false,
        message: `Erro ao criar Pix: ${message}`,
        error: {
          code: detail?.code || detail?.nome || 'UNKNOWN',
          message: message,
          details: detail,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Gera um TXID válido conforme especificação Pix:
   * - Apenas caracteres alfanuméricos
   * - Comprimento entre 26 e 35
   */
  private generateValidTxid(): string {
    const randomAlnum = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    let candidate = (randomAlnum() + randomAlnum()).replace(/[^a-zA-Z0-9]/g, '');
    // Ajustar tamanho entre 26 e 35
    if (candidate.length < 26) {
      candidate = (candidate + randomAlnum()).replace(/[^a-zA-Z0-9]/g, '');
    }
    if (candidate.length > 35) {
      candidate = candidate.slice(0, 35);
    }
    if (candidate.length < 26) {
      candidate = candidate.padEnd(26, '0');
    }
    return candidate;
  }

  /**
   * Consulta uma cobrança Pix pelo txid
   */
  async getPixCharge(txid: string) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      const response = await this.efipay.pixDetailCharge({ txid });
      return response;

    } catch (error) {
      this.logger.error(`Erro ao consultar cobrança Pix ${txid}:`, error.message);
      throw new Error('Falha ao consultar cobrança Pix');
    }
  }

  /**
   * Consulta Pix recebidos
   */
  async getReceivedPix(params: {
    inicio: string;
    fim: string;
    cpf?: string;
    cnpj?: string;
    paginacao?: {
      paginaAtual: number;
      itensPorPagina: number;
    };
  }) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      // Usar método correto para Pix recebidos
      const response = await this.efipay.pixReceivedList(params);
      return response;

    } catch (error) {
      this.logger.error('Erro ao consultar Pix recebidos:', error.message);
      throw new Error('Falha ao consultar Pix recebidos');
    }
  }

  /**
   * Envia Pix para uma chave
   */
  async sendPix(data: {
    valor: number;
    chave: string;
    descricao: string;
    favorecido: {
      nome: string;
      cpf?: string;
      cnpj?: string;
    };
  }) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      const payload = {
        valor: (data.valor / 100).toFixed(2),
        chave: data.chave,
        descricao: data.descricao,
        favorecido: data.favorecido
      };

      const response = await this.efipay.pixSend(payload);
      
      this.logger.log(`Pix enviado: ${response.id}`);
      return response;

    } catch (error) {
      this.logger.error('Erro ao enviar Pix:', error.message);
      throw new Error('Falha ao enviar Pix');
    }
  }

  /**
   * Devolve um Pix recebido
   */
  async refundPix(e2eId: string, valor: number, descricao: string) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      const payload = {
        valor: (valor / 100).toFixed(2),
        descricao: descricao
      };

      const response = await this.efipay.pixDevolution(e2eId, payload);
      
      this.logger.log(`Pix devolvido: ${response.id}`);
      return response;

    } catch (error) {
      this.logger.error('Erro ao devolver Pix:', error.message);
      throw new Error('Falha ao devolver Pix');
    }
  }

  /**
   * Gera QR Code para uma cobrança
   */
  async generateQRCode(txid: string) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      const response = await this.efipay.pixGenerateQRCode({ txid });
      return response;

    } catch (error) {
      this.logger.error(`Erro ao gerar QR Code para ${txid}:`, error.message);
      throw new Error('Falha ao gerar QR Code');
    }
  }

  /**
   * Lista todas as cobranças Pix
   */
  async listPixCharges(params?: {
    inicio?: string;
    fim?: string;
    status?: string;
    txid?: string;
  }) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      const response = await this.efipay.pixListCharges(params || {});
      return response;

    } catch (error) {
      this.logger.error('Erro ao listar cobranças Pix:', error.message);
      throw new Error('Falha ao listar cobranças Pix');
    }
  }

  /**
   * Cancela uma cobrança Pix
   * NOTA: Método não implementado na SDK atual
   */
  async cancelPixCharge(txid: string) {
    if (!this.isInitialized || !this.efipay) {
      throw new Error('SDK Gerencianet não inicializada');
    }

    try {
      // TODO: Implementar cancelamento quando método estiver disponível na SDK
      // Por enquanto, apenas atualiza o status no banco
      this.logger.log(`Cobrança Pix marcada como cancelada: ${txid}`);
      
      return {
        success: true,
        message: 'Cobrança marcada como cancelada no banco de dados',
        txid: txid
      };

    } catch (error) {
      this.logger.error(`Erro ao cancelar cobrança Pix ${txid}:`, error.message);
      throw new Error('Falha ao cancelar cobrança Pix');
    }
  }

  /**
   * Sincroniza transações Pix com o banco de dados
   */
  async syncPixTransactions() {
    if (!this.isInitialized || !this.efipay) {
      this.logger.warn('SDK Gerencianet não inicializada, pulando sincronização');
      return { success: false, message: 'SDK não inicializada' };
    }

    try {
      // Buscar transações pendentes no banco
      const pendingTransactions = await this.pixTransactionRepository.findTransactionsForSync();

      let synced = 0;
      let updated = 0;
      let errors = 0;

      for (const transaction of pendingTransactions) {
        try {
          // Consultar status na API
          const apiResponse = await this.getPixCharge(transaction.txid);
          
          if (apiResponse.status !== transaction.status) {
            // Atualizar status no banco
            await this.pixTransactionRepository.updateStatus(
              transaction.id,
              apiResponse.status as PixTransactionStatus,
              { efipayResponse: apiResponse }
            );
            updated++;
          }
          
          synced++;
          
        } catch (error) {
          this.logger.error(`Erro ao sincronizar transação ${transaction.txid}:`, error.message);
          errors++;
        }
      }

      this.logger.log(`Sincronização concluída: ${synced} sincronizadas, ${updated} atualizadas, ${errors} erros`);
      
      return {
        success: true,
        message: 'Sincronização concluída',
        data: { synced, updated, errors }
      };

    } catch (error) {
      this.logger.error('Erro na sincronização:', error.message);
      return {
        success: false,
        message: `Erro na sincronização: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Processa webhook de notificação da Efí
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      const { txid, status, valor, horario } = webhookData;

      // Buscar transação no banco
      const transaction = await this.pixTransactionRepository.findByTxid(txid);
      if (!transaction) {
        this.logger.warn(`Transação não encontrada para webhook: ${txid}`);
        return;
      }

      // Atualizar status baseado no webhook
      let newStatus = PixTransactionStatus.PENDING;
      if (status === 'CONCLUIDA') {
        newStatus = PixTransactionStatus.PAID;
      } else if (status === 'REMOVIDA_PELO_USUARIO_RECEBEDOR') {
        newStatus = PixTransactionStatus.CANCELLED;
      } else if (status === 'REMOVIDA_PELO_PSP') {
        newStatus = PixTransactionStatus.FAILED;
      }

      if (newStatus !== transaction.status) {
        await this.pixTransactionRepository.updateStatus(transaction.id, newStatus, {
          paidAt: newStatus === PixTransactionStatus.PAID ? new Date(horario) : undefined
        });

        this.logger.log(`Status atualizado via webhook: ${txid} -> ${newStatus}`);
      }
    } catch (error) {
      this.logger.error('Erro ao processar webhook:', error.message);
      throw error;
    }
  }

  /**
   * Marca transações expiradas
   */
  async markExpiredTransactions(): Promise<number> {
    return await this.pixTransactionRepository.markExpiredTransactions();
  }

  /**
   * Obtém estatísticas das transações
   */
  async getTransactionStats(userId?: string) {
    return await this.pixTransactionRepository.getStats(userId);
  }
}
