export class Notification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly createdAt: Date;
  readonly userId: string;
  
  constructor(
    title: string,
    message: string,
    userId: string,
  ) {
    this.id = Notification.generateId();
    this.title = title;
    this.message = message;
    this.createdAt = new Date();
    this.userId = userId;
  }

  private static generateId(): string {
    return crypto.randomUUID();
  }
}