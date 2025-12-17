export class CompletedQuizQueryCriteria {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly order: 'ASC' | 'DESC',
    public readonly orderBy: string,
  ) {}
}
