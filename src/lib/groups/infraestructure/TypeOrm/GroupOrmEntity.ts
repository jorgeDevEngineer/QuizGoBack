import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberOrmEntity } from "./GroupOrnMember";
import { GroupQuizAssignmentOrmEntity } from "./GroupQuizAssigmentOrmEntity";


@Entity({ name: "groups" })
export class GroupOrmEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 80 })
  name!: string;

  @Column({ type: "varchar", length: 300, default: "" })
  description!: string;

  @Column("uuid")
  adminId!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  invitationToken?: string | null;

  @Column({ type: "timestamptz", nullable: true })
  invitationExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => GroupMemberOrmEntity, (m) => m.group, {
  cascade: true,
  eager: true,
  orphanedRowAction: "delete",
})
members!: GroupMemberOrmEntity[];

@OneToMany(
  () => GroupQuizAssignmentOrmEntity,
  (a) => a.group,
  {
    cascade: true,
    eager: true,
  },
)
assignments!: GroupQuizAssignmentOrmEntity[];
}