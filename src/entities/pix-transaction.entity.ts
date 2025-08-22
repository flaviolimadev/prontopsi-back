import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './user.entity';
import { Paciente } from './paciente.entity';

export enum PixTransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export enum PixTransactionType {
  CHARGE = 'CHARGE',      // Cobrança recebida
  SEND = 'SEND',          // Pix enviado
  REFUND = 'REFUND'       // Devolução
}

@Entity('pix_transactions')
@Index(['txid'], { unique: true })
@Index(['userId', 'status'])
@Index(['pacienteId', 'status'])
@Index(['createdAt'])
export class PixTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  txid: string; // ID da transação da Efí

  @Column({ type: 'enum', enum: PixTransactionType })
  type: PixTransactionType;

  @Column({ type: 'enum', enum: PixTransactionStatus, default: PixTransactionStatus.PENDING })
  status: PixTransactionStatus;

  @Column({ type: 'int' })
  valor: number; // Valor em centavos

  @Column({ type: 'varchar', length: 255 })
  chave: string; // Chave Pix (email, CPF, telefone, etc.)

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'text', nullable: true })
  qrcode: string; // String do QR Code

  @Column({ type: 'text', nullable: true })
  qrcodeImage: string; // URL da imagem do QR Code

  @Column({ type: 'jsonb' })
  devedor: {
    nome: string;
    cpf: string;
    email?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  favorecido?: {
    nome: string;
    cpf: string;
    conta: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // Quando o Pix foi pago

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date; // Quando a cobrança expira

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sessionId?: string;        // ID da sessão relacionada
    paymentMethod?: string;    // Método de pagamento
    notes?: string;           // Observações adicionais
    [key: string]: any;       // Campos flexíveis
  };

  @Column({ type: 'varchar', nullable: true })
  userId: string; // Relacionamento com usuário (nullable para testes públicos)

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  pacienteId: string; // Relacionamento com paciente (opcional)

  @ManyToOne(() => Paciente, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'varchar', length: 100, nullable: true })
  e2eId: string; // ID end-to-end para Pix recebidos

  @Column({ type: 'varchar', length: 100, nullable: true })
  refundId: string; // ID da devolução se aplicável

  @Column({ type: 'jsonb', nullable: true })
  efipayResponse: {
    // Resposta completa da API da Efí para auditoria
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos auxiliares
  isExpired(): boolean {
    if (this.expiredAt) {
      return new Date() > this.expiredAt;
    }
    return false;
  }

  isPaid(): boolean {
    return this.status === PixTransactionStatus.PAID;
  }

  canBeRefunded(): boolean {
    return this.isPaid() && !this.refundId;
  }

  getFormattedValue(): string {
    return `R$ ${(this.valor / 100).toFixed(2).replace('.', ',')}`;
  }

  getDaysUntilExpiration(): number {
    if (!this.expiredAt) return 0;
    const now = new Date();
    const diffTime = this.expiredAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
