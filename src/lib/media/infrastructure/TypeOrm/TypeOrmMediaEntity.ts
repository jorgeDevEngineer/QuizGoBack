import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class TypeOrmMediaEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @Column({ type: 'bytea', nullable: true }) // Columna para la miniatura
  thumbnail: Buffer;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  originalName: string;

  @CreateDateColumn()
  createdAt: Date;
}
