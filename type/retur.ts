import { InventoryMovement } from "./inventory_movement";

export type Retur = {
    retur_id: string;
    retur_number: string;
    sales_id: string;
    delivery_number: string;
    status: string;
    type: string;
    delivery_fee: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    items: InventoryMovement[];
};