import { Column, Entity, PrimaryColumn } from 'typeorm';

interface AnswerEmbed {
    id: string;
    text?: string;
    mediaUrl?: string;
    isCorrect: boolean;
}

interface QuestionEmbed {
    id: string;
    text: string;
    mediaUrl?: string;
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

  @Column()
  themeId: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ type: 'jsonb' })
  questions: QuestionEmbed[];
}
