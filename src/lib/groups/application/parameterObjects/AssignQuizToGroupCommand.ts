export class AssignQuizToGroupCommand {
    constructor(
        public readonly groupId: string,
        public readonly quizId: string,
        public readonly currentUserId: string,
        public readonly availableUntil: Date,
        public readonly now?: Date,
    ) {}
}
    