import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { GroupOrmEntity } from "./GroupOrmEntity";

@Entity({ name: "group_quiz_assignments" })
export class GroupQuizAssignmentOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @ManyToOne(() => GroupOrmEntity, (g) => g.assignments, {
    onDelete: "CASCADE",
  })
  group!: GroupOrmEntity;

  @Column("uuid")
  quizId!: string;

  @Column("uuid")
  assignedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamptz" })
  availableFrom!: Date;

  @Column({ type: "timestamptz" })
  availableUntil!: Date;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}