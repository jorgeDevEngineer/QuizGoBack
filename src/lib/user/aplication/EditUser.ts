import { User } from "../domain/entity/User";
import { UserRepository } from "../domain/port/UserRepository";
import { UserDate } from "../domain/valueObject/UserDate";
import { UserId } from "../domain/valueObject/UserId";

export class EditUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    id: string,
    userName: string,
    email: string,
    hasshedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    name: string,
    theme: string,
    language: string,
    gameStreak: number
  ): Promise<void> {
    const createdAt = (await this.userRepository.getOneById(new UserId(id)))
      ?.createdAt.value;
    const updatedAt = new Date();
    const user = new User(
      id,
      userName,
      email,
      hasshedPassword,
      userType,
      avatarUrl,
      name,
      theme,
      language,
      gameStreak,
      createdAt,
      updatedAt
    );
    await this.userRepository.edit(user);
  }
}
