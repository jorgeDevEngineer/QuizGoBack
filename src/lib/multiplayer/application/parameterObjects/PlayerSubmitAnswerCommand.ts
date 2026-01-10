export class PlayerSubmitAnswerCommand  {

    constructor(
        public readonly questionId: string,
        public readonly answerId: number[],
        public readonly timeElapsedMs: number,
        public readonly sessionPin: string,
        public readonly userId: string,
    ){}

}