import { UserRepository } from "../domain/port/UserRepository";
import { User } from "../domain/entity/User";
import { UserId } from "../domain/valueObject/UserId";

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    id?: string,
    name?: string,
    theme?: string,
    language?: string,
    gameStreak?: number,
    createdAt?: Date,
    updatedAt?: Date
  ): Promise<void> {
    const newUser = new User(
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
    const userWithSameId = await this.userRepository.getOneById(newUser.id);
    const userWithSameUserName = await this.userRepository.getOneByName(
      newUser.userName
    );
    if (userWithSameId) {
      throw new Error("User with this ID already exists");
    }
    if (userWithSameUserName) {
      throw new Error("User with this username already exists");
    }
    await this.userRepository.create(newUser);
  }
}
