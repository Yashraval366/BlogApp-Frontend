export interface paginatedResult<T>
{
    items: T[],
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}