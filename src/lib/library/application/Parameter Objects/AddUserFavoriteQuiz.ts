export class AddUserFavoriteQuiz{
    constructor(
      public readonly userId: string,
      public readonly quizId: string
    ) {}
}