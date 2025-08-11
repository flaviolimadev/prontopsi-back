import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('paciente_arquivos')
export class PacienteArquivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tipo: string | null; // mimetype

  @Column({ type: 'int', nullable: true })
  tamanho: number | null; // bytes

  @Column({ type: 'text' })
  url: string; // URL pública no R2

  @Column({ type: 'varchar', length: 512, nullable: true })
  chave: string | null; // key no bucket

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Paciente', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: any;
}
