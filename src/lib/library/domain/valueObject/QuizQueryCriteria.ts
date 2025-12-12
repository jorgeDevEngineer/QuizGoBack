export class QuizQueryCriteria {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly orderBy: 'createdAt' | 'title' | 'likesCount',
    public readonly order: 'ASC' | 'DESC',
    public readonly status: 'draft' | 'published' | 'all',
    public readonly visibility: 'public' | 'private' | 'all',
    public readonly categories: string[],
    public readonly search?: string,
    public readonly q?: string,
    ) {}
  }
    