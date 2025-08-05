import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'date' })
  vencimento: Date;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'int', default: 0 })
  status: number; // 0: pendente, 1: pago, 2: confirmado, 3: cancelado

  @Column({ type: 'int', nullable: true })
  type: number | null; // 1: PIX, 2: Cartão, 3: Boleto, 4: Espécie

  @Column({ type: 'varchar', length: 255, nullable: true })
  txid: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne('User', 'pagamentos')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Paciente', 'pagamentos')
  @JoinColumn({ name: 'paciente_id' })
  paciente: any;

  @ManyToOne('Pacote', 'pagamentos')
  @JoinColumn({ name: 'pacote_id' })
  pacote: any;

  @ManyToOne('AgendaSessao', 'pagamentos')
  @JoinColumn({ name: 'agenda_sessao_id' })
  agendaSessao: any;
} 