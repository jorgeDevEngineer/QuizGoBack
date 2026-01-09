
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media')
export class TypeOrmMediaEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ name: 'author_id' })
    authorId: string;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    category: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
