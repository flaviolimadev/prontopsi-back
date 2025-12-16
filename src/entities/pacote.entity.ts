import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('pacotes')
export class Pacote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'paciente_id', type: 'uuid', nullable: true })
  pacienteId: string | null;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'descricao', type: 'text', nullable: true })
  descricao: string | null;

  @Column({ name: 'sessoes_total', type: 'int' })
  sessoesTotal: number;

  @Column({ name: 'sessoes_usadas', type: 'int', default: 0 })
  sessoesUsadas: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ name: 'valor_por_sessao', type: 'decimal', precision: 10, scale: 2 })
  valorPorSessao: number;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: Date | null;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne('User', 'pacotes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @OneToMany('Pagamento', 'pacote')
  pagamentos: any[];
} 