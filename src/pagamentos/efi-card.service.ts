import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

const EfiPay = require('sdk-node-apis-efi');

@Injectable()
export class EfiCardService {
  private readonly logger = new Logger(EfiCardService.name);
  private efipay: any = null;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      const clientId = this.configService.get('EFI_CLIENT_ID');
      const clientSecret = this.configService.get('EFI_CLIENT_SECRET');
      const sandbox = String(this.configService.get('EFI_SANDBOX') || '')
        .toLowerCase()
        .trim() === 'true';

      const passphrase = this.configService.get('EFI_CERT_PASSPHRASE') || '';
      const certBase64 = this.configService.get('EFI_CERT_BASE64') === 'true';
      const certBase64ContentEnv = this.configService.get('EFI_CERT_BASE64_CONTENT');
      const certPathOrContent = this.configService.get('EFI_CERT_PATH') || './certs/certificado.p12';

      let certificateOption: string;
      if (certBase64) {
        if (certBase64ContentEnv && certBase64ContentEnv.length > 100) {
          certificateOption = certBase64ContentEnv;
        } else {
          const fileBuf = fs.readFileSync(path.resolve(certPathOrContent));
          certificateOption = fileBuf.toString('base64');
        }
      } else {
        if (!fs.existsSync(path.resolve(certPathOrContent))) {
          this.logger.error(`Certificado não encontrado em: ${certPathOrContent}`);
          this.isInitialized = false;
          return;
        }
        certificateOption = path.resolve(certPathOrContent);
      }

      const options: any = {
        sandbox,
        client_id: clientId,
        client_secret: clientSecret,
        certificate: certificateOption,
        cert_base64: certBase64,
        passphrase,
        validateMtls: this.configService.get('EFI_VALIDATE_MTLS') === 'true',
      };

      this.efipay = new EfiPay(options);
      this.isInitialized = true;
      this.logger.log(`SDK cartão inicializada (${sandbox ? 'HOMOLOGAÇÃO' : 'PRODUÇÃO'})`);
    } catch (e: any) {
      this.logger.error('Falha ao inicializar SDK cartão:', e?.message || e);
      this.isInitialized = false;
    }
  }

  async getInstallments(brand: string, totalInCents: number) {
    if (!this.isInitialized) throw new Error('SDK não inicializada');
    return this.efipay.getInstallments({ brand, total: totalInCents });
  }

  async createOneStepCardCharge(data: {
    amountInCents: number;
    description: string;
    paymentToken: string; // gerado no front pela Efí JS
    installments?: number;
    customer: { name: string; email: string; cpf: string; birth?: string; phone_number?: string };
    billing: { street: string; number: number; neighborhood: string; zipcode: string; city: string; state: string };
  }) {
    if (!this.isInitialized) throw new Error('SDK não inicializada');

    const body = {
      payment: {
        credit_card: {
          installments: data.installments || 1,
          payment_token: data.paymentToken,
          billing_address: data.billing,
          customer: data.customer,
        },
      },
      items: [
        {
          name: data.description || 'Pagamento ProntuPsi',
          value: data.amountInCents,
          amount: 1,
        },
      ],
    };

    return this.efipay.createOneStepCharge([], body);
  }

  async refundCard(chargeId: number, valueInCents?: number) {
    if (!this.isInitialized) throw new Error('SDK não inicializada');
    const params = { id: chargeId };
    const body = valueInCents ? { value: valueInCents } : {};
    return this.efipay.refundCard(params, body);
  }
}






