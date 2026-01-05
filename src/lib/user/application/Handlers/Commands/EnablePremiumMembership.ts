import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundError } from "./../../error/UserNotFoundError.js";

export class EnablePremiumMembership {
  constructor(private readonly userRepository: UserRepository) {}
  async run(id: string): Promise<void> {
    const user = await this.userRepository.getOneById(new UserId(id));
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    user.enablePremiumMembership();
    await this.userRepository.edit(user);
  }
}
