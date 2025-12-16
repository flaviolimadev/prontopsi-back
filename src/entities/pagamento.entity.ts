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

  @Column({ name: 'value', type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'data_pagamento', type: 'date' })
  data: Date;

  @Column({ name: 'metodo_pagamento', type: 'varchar', length: 50 })
  metodoPagamento: string;

  @Column({ name: 'observacao', type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'int', default: 0, nullable: true })
  status: number; // 0: pendente, 1: pago, 2: confirmado, 3: cancelado

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