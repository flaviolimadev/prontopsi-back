import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('anamneses')
@Unique(['userId', 'pacienteId'])
export class Anamnese {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  // adulto | menor
  @Column({ type: 'varchar', length: 16 })
  tipo: string;

  // Respostas livres, chave = perguntaId ou índice, valor = resposta
  @Column({ type: 'jsonb', nullable: false, default: () => "'{}'::jsonb" })
  respostas: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('User', 'anamneses')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Paciente', 'anamneses')
  @JoinColumn({ name: 'paciente_id' })
  paciente: any;
}


