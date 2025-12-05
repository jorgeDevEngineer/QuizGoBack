export class GroupNotFoundError extends Error {
  constructor(groupId: string) {
    super(`Group with id ${groupId} was not found`);
    this.name = "GroupNotFoundError";
  }
}