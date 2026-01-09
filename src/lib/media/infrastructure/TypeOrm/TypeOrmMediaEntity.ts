import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { MediaType } from '../../domain/entity/Media';

@Entity('media')
export class TypeOrmMediaEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    key: string;

    @Column({ type: 'enum', enum: ['single', 'multiple'] })
    type: MediaType;

    @Column()
    category: string;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column('int')
    size: number;

    @Column({ name: 'author_id' })
    authorId: string;

    @Column({ name: 'original_name' })
    originalName: string;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
