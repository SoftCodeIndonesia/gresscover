import { InventoryMovement } from "./inventory_movement";

export type Sale = {
    sale_id: string|null;
    sale_date: string|null;
    total_amount: string|null;
    payment_method: string|null;
    created_at: string|null;
    updated_at: string|null;
    user_id: number|null;
    order_number: string|null;
    delivery_number: string|null;
    status: string|null;
    platform: string|null;
    items: InventoryMovement[],
    taxes: SaleTax[],
}

export type SaleTax = {
    sale_tax_id: string,
    tax_id: string,
    sale_id: string,
    name: string|null,
    value: number,
    unit_value: string|null,
}