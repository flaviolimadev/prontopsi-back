import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Paciente } from './paciente.entity';
import { Pacote } from './pacote.entity';
import { AgendaSessao } from './agenda-sessao.entity';

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  @Column({ name: 'pacote_id', type: 'uuid', nullable: true })
  pacoteId: string | null;

  @Column({ name: 'agenda_sessao_id', type: 'uuid', nullable: true })
  agendaSessaoId: string | null;

  @Column({ type: 'date' })
  data: string;

  @Column({ type: 'date' })
  vencimento: string;

  @Column({ type: 'int', default: 0 })
  status: number; // 0 pendente, 1 pago, 2 confirmado, 3 cancelado

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'int', nullable: true })
  type: number | null; // 1 pix, 2 cartão, 3 boleto, 4 espécie

  @Column({ type: 'varchar', length: 255, nullable: true })
  txid: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => User, user => user.pagamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Paciente, paciente => paciente.pagamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @ManyToOne(() => Pacote, pacote => pacote.pagamentos, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pacote_id' })
  pacote: Pacote | null;

  @ManyToOne(() => AgendaSessao, agendaSessao => agendaSessao.pagamentos, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agenda_sessao_id' })
  agendaSessao: AgendaSessao | null;
} 