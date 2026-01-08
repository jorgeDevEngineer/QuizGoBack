
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('quizzes')
export class TypeOrmQuizEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  visibility: string;

  @Column()
  status: string;

  @Column()
  category: string;

  @Column()
  themeId: string;

  @Column({ nullable: true })
  coverImageId: string;

  @Column()
  createdAt: Date;

  @Column()
  playCount: number;

  @Column({ type: 'jsonb' })
  questions: any[];
}
