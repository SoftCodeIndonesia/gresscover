export type TransactionType = {
    unique_id: string,
    type: string,
    reference_id: string,
    reference: string|null,
    status: string,
    total_amount: number,
    created_at: string,
    updated_at: string,
    created_by: number,
    text: string|null,
}