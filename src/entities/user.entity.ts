import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome', type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'sobrenome', type: 'varchar', length: 100 })
  sobrenome: string;

  @Index({ unique: true })
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Index({ unique: true })
  @Column({ name: 'code', type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ name: 'contato', type: 'varchar', length: 20, nullable: true })
  contato: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'crp', type: 'varchar', length: 20, nullable: true })
  crp: string | null;

  @Column({ name: 'clinic_name', type: 'varchar', length: 255, nullable: true })
  clinicName: string | null;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'whatsapp_number', type: 'varchar', length: 20, nullable: true })
  whatsappNumber: string | null;

  @Column({ name: 'whatsapp_reports_enabled', type: 'boolean', default: false })
  whatsappReportsEnabled: boolean;

  @Column({ name: 'whatsapp_report_time', type: 'varchar', length: 5, nullable: true })
  whatsappReportTime: string | null;

  @Column({ name: 'report_config', type: 'json', nullable: true })
  reportConfig: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  } | null;

  @Exclude()
  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'status', type: 'int', default: 1 })
  status: number;

  @Column({ name: 'pontos', type: 'int', default: 0, comment: 'Valores em centavos' })
  pontos: number;

  @Column({ name: 'nivel_id', type: 'int', default: 1 })
  nivelId: number;

  @Column({ name: 'plano_id', type: 'uuid', nullable: true })
  planoId: string | null;

  @Column({ name: 'avatar', type: 'varchar', length: 1000, nullable: true })
  avatar: string | null;

  @Column({ name: 'descricao', type: 'text', nullable: true })
  descricao: string | null;

  @Column({ name: 'referred_at', type: 'varchar', length: 20, nullable: true })
  referredAt: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_code', type: 'varchar', length: 6, nullable: true })
  emailVerificationCode: string | null;

  @Column({ name: 'email_verification_expires', type: 'timestamp', nullable: true })
  emailVerificationExpires: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @OneToMany('Paciente', 'user')
  pacientes: any[];

  @OneToMany('AgendaSessao', 'user')
  agendaSessoes: any[];

  @OneToMany('Pacote', 'user')
  pacotes: any[];

  @OneToMany('Pagamento', 'user')
  pagamentos: any[];
  // @JoinColumn({ name: 'plano_id' })
  // plano: Plano;

  // @ManyToOne(() => User, user => user.referrals)
  // @JoinColumn({ name: 'referred_at', referencedColumnName: 'code' })
  // referredBy: User;

  // @OneToMany(() => User, user => user.referredBy)
  // referrals: User[];

  // Métodos auxiliares
  get fullName(): string {
    return `${this.nome} ${this.sobrenome}`;
  }

  get pontosEmReais(): number {
    return this.pontos / 100;
  }

  set pontosEmReais(valor: number) {
    this.pontos = Math.round(valor * 100);
  }

  isActive(): boolean {
    return this.status === 1;
  }

  isPremium(): boolean {
    return this.planoId !== null;
  }
} 