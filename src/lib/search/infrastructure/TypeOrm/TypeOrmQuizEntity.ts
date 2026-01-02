import { Column, Entity, PrimaryColumn } from 'typeorm';

interface AnswerEmbed {
    id: string;
    text?: string;
    mediaId?: string;
    isCorrect: boolean;
}

interface QuestionEmbed {
    id: string;
    text: string;
    mediaId?: string;
    type: 'quiz' | 'true_false';
    timeLimit: number;
    points: number;
    answers: AnswerEmbed[];
}

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

  @Column({ default: 'private' })
  visibility: 'public' | 'private';

  @Column({ default: 'draft' })
  status: 'draft' | 'publish';

  @Column()
  category: string;

  @Column()
  themeId: string;

  @Column({ nullable: true })
  coverImageId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  playCount: number;

  @Column({ type: 'jsonb' })
  questions: QuestionEmbed[];
}
