import { InventoryMovement } from "./inventory_movement";
import { Sale } from "./sale";

export type ExchangeType = {
    exchange_id: string;
    exchange_number: string;
    sales_id: string;
    status: string;
    delivery_fee: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    sales_number: string;
    note: string | null;
    delivery_number: string;
    sales?: Sale,
    items: InventoryMovement[],
};
