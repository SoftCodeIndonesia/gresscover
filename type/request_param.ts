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
}