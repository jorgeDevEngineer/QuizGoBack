import { UserId } from "../valueObject/UserId";
import { User } from "../aggregate/User";
import { UserName } from "../valueObject/UserName";

export interface UserRepository {
  getAll(): Promise<User[]>;
  getOneById(id: UserId): Promise<User | null>;
  getOneByName(name: UserName): Promise<User | null>;
  create(user: User): Promise<void>;
  edit(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
