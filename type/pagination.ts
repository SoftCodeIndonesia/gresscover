export type Pagination<T> = {
    current_page: number,
    last_page: number,
    total: number,
    per_page: number,
    data: T[],
}