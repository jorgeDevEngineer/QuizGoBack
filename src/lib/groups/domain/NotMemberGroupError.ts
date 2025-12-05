export class UserNotMemberOfGroupError extends Error {
  constructor(userId: string, groupId: string) {
    super(`User ${userId} is not a member of group ${groupId}`);
    this.name = "UserNotMemberOfGroupError";
  }
}