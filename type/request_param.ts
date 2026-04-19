type Search = {
    value: string,
    column: any[],
}


export type RequestParam = {
    table: string,
    search?: Search | null,
    request_column?: string[] | null,
    request_column_relation: string[] | null, 
    limit: number,
    page: number,
    where?: any | null,
    search_relation?: any | null,
    whereHas?: any | null,
    group?: string|null,
    orderBy?: any,
    type?: string,
}
export type NewRequestParam = {
    table: string,
    keyword?: string,
    request_column?: string[] | null,
    limit: number,
    page: number,
    where?: any | null,
    group?: string|null,
    orderBy?: any,
    type?: string,
    request_column_relation?: string[],
}