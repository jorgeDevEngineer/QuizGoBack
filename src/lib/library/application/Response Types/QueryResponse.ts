import { Pagination } from "./Pagination";

export type QueryResponse<T> = {
    data: T[];
    pagination: Pagination;
  }  