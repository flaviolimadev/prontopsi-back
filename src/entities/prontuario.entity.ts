import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('prontuarios')
export class Prontuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'avaliacao_demanda', type: 'text', nullable: true })
  avaliacaoDemanda: string | null;

  @Column({ name: 'evolucao', type: 'json', nullable: true })
  evolucao: any[] | null;

  @Column({ name: 'encaminhamento', type: 'text', nullable: true })
  encaminhamento: string | null;

  @Column({ name: 'anexos', type: 'json', nullable: true })
  anexos: any[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos removidos para evitar problemas com queries
  // Os relacionamentos são gerenciados apenas via foreign keys no banco
} 