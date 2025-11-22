import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'media' })
export class TypeOrmMediaEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;

  @Column()
  mimeType!: string;

  @Column('int')
  size!: number;

  @Column()
  originalName!: string;

  @Column({ type: 'timestamp' })
  createdAt!: Date;
}
