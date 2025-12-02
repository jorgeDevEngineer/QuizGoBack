import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_favorite_quizzes')
export class TypeOrmUserFavoriteQuizEntity {
  @PrimaryColumn('uuid')
  user_id: string;

  @PrimaryColumn('uuid')
  quiz_id: string;
}
