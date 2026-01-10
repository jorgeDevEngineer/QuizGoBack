import { Entity, PrimaryColumn } from 'typeorm';

@Entity('user_favorite_quizzes')
export class TypeOrmPostgresUserFavoriteQuizEntity {
  @PrimaryColumn('uuid')
  user_id: string;

  @PrimaryColumn('uuid')
  quiz_id: string;
}
