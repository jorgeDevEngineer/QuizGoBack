/** 
 *Tipo para paginación de resultados 
*/
export type Pagination = {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
}