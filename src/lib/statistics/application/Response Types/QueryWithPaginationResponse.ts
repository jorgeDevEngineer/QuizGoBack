import { Pagination } from "./Pagination";

/**
 * Tipo de respuesta para consultas que incluyen paginación.
 */
export type QueryWithPaginationResponse<T> = {
    results: T[];
    pagination: Pagination;
  }  