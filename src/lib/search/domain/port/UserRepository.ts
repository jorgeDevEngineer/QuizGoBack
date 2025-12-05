import { UserId } from "../valueObject/UserId";


export interface UserRepository {
  getNameById(id: string): Promise<string>;
}
