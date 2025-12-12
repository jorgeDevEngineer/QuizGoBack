import { Pagination } from "./Pagination";

export type QueryWithPaginationResponse<T> = {
    data: T[];
    pagination: Pagination;
  }  