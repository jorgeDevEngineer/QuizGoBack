import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class TypeOrmUserEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  hashedPassword: string;

  @Column()
  userType: "student" | "teacher" | "personal";

  @Column()
  avatarUrl: string;

  @Column()
  name: string;

  @Column()
  theme: string;

  @Column()
  language: string;

  @Column()
  gameStreak: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  membershipType: "free" | "premium";

  @Column()
  membershipStartedAt: Date;

  @Column()
  membershipExpiresAt: Date;
}
