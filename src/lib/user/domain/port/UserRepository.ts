import { UserId } from "../valueObject/UserId";
import { User } from "../entity/User";

export interface UserRepository {
  getAll(): Promise<User[]>;
  getOneById(id: UserId): Promise<User | null>;
  create(user: User): Promise<void>;
  edit(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
