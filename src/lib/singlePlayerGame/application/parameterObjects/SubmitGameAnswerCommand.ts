export class SubmitGameAnswerCommand {
  constructor(
    public readonly attemptId: string,
    public readonly slideId: string,
    public readonly answerIndex: number[],
    public readonly timeElapsedSeconds: number
  ) {}
}