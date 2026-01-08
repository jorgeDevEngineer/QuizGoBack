import { Entity, ObjectIdColumn, Column, Index } from "typeorm";
import { ObjectId } from "mongodb";

@Entity("user_favorite_quizzes")
@Index(["user_id", "quiz_id"], { unique: true }) // índice compuesto para garantizar unicidad
export class TypeOrmMongoUserFavoriteQuizEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  user_id: string;

  @Column()
  quiz_id: string;
}
