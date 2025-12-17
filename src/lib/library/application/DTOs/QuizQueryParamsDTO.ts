import { QuizQueryCriteria } from "../Response Types/QuizQueryCriteria";

export type QuizQueryParamsInput = {
  page?: number;
  limit?: number;

  status?: 'draft' | 'published' | 'all';
  visibility?: 'public' | 'private' | 'all';
  categories?: string[];

  orderBy?: 'createdAt' | 'title' | 'likesCount';
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';

  search?: string;
  q?: string;
};

export class QuizQueryParamsDTO {
  // Paginación
  page?: number;
  limit?: number;

  // Filtros
  status?: 'draft' | 'published' | 'all';
  visibility?: 'public' | 'private' | 'all';
  categories?: string[];

  // Ordenamiento
  orderBy?: 'createdAt' | 'title' | 'likesCount';
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';

  // Búsqueda
  search?: string;
  q?: string;

  constructor(input: QuizQueryParamsInput = {}) {
    // Page: default 1
    const rawPage = Number(input.page);
    this.page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    // Limit: default 20, max 50
    const rawLimit = Number(input.limit);
    this.limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, 50)
        : 20;

    // Status: default "all"
    this.status = input.status || 'all';

    // Visibility: default "all"
    this.visibility = input.visibility || 'all';

    // Categories: default []
    this.categories = Array.isArray(input.categories) ? input.categories : [];

    // OrderBy: default "createdAt"
    this.orderBy = input.orderBy || 'createdAt';

    // Order: default "asc"
    const normalizedOrder = (input.order || 'asc').toString().toUpperCase();
    this.order =
      normalizedOrder === 'ASC' || normalizedOrder === 'DESC'
        ? normalizedOrder
        : 'ASC';

    // Search: trim
    this.search = input.search?.trim() || undefined;

    // q: trim
    this.q = input.q?.trim() || undefined;
  }

  toCriteria(): QuizQueryCriteria {
    return new QuizQueryCriteria(
      this.page!,
      this.limit!,
      this.orderBy!,
      this.order as 'ASC' | 'DESC',
      this.status!,
      this.visibility!,
      this.categories!,
      this.search,
      this.q,
    );
  }
}
