import { Column, Entity, PrimaryColumn } from "typeorm";
import { Notification } from "../../domain/entity/Notification";

@Entity("notifications")
export class TypeOrmNotificationEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;
}
