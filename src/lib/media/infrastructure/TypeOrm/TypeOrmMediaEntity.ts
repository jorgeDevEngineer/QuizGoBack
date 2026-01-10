
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class TypeOrmMediaEntity {
    @PrimaryColumn('uuid')
    mediaId: string;

    @Column({ name: 'author_id' })
    authorId: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column('int')
    size: number;

    @Column()
    format: string;

    @Column()
    category: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
