import { User } from "../domain/entity/User";
import { UserRepository } from "../domain/port/UserRepository";
import { UserDate } from "../domain/valueObject/UserDate";
import { UserId } from "../domain/valueObject/UserId";

export class EditUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    id: string,
    name: string,
    theme: string,
    language: string,
    gameStreak: number
  ): Promise<void> {
    const createdAt = (await this.userRepository.getOneById(new UserId(id)))
      ?.createdAt.value;
    const updatedAt = new Date();
    const user = new User(
      userName,
      email,
      hashedPassword,
      userType,
      avatarUrl,
      id,
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
