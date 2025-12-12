export class DeleteUserFavoriteQuiz{
    constructor(
      public readonly userId: string,
      public readonly quizId: string
    ) {}
}