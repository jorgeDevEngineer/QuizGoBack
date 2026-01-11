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
  userType: "STUDENT" | "TEACHER";

  @Column()
  avatarAssetId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "simple-array", default: "user" })
  roles: string[];

  @Column()
  theme: "LIGHT" | "DARK";

  @Column()
  language: string;

  @Column()
  gameStreak: number;

  @Column({ name: "isadmin", default: false })
  isAdmin: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ nullable: true })
  membershipType: "free" | "premium";

  @Column({ nullable: true })
  membershipStartedAt: Date;

  @Column({ nullable: true })
  membershipExpiresAt: Date;

  @Column()
  status: "active" | "blocked";
}
