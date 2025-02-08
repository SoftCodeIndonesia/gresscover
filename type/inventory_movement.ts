import { Inventory } from "./inventory";
import { Item } from "./item";

export type InventoryMovement = {
    id: string;
    product_id: string;
    quantity: number;
    unit_id: string|null;
    unit_name: string|null;
    created_at: string;
    updated_at: string;
    amount: number;
    total_amount: number;
    status: string;
    note: string | null;
    reference: string | null;
    reference_id: string | null;
    inventory_id: string;
    type: string;
    inventory: Inventory;
    item: Item;
    mutation_history: InventoryMovement[],
}