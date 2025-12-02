import { User } from "../domain/entity/User";
import { UserRepository } from "../domain/port/UserRepository";

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
    gameStreak: number,
    createdAt: Date,
    updatedAt: Date
  ): Promise<void> {
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
