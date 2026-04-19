import { Inventory } from "./inventory";
import { Item } from "./item";
import { User } from "./user";

export enum InventoryMovementStatus {
    COMPLETED = "completed",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    DELIVER_TO_SELLER = "deliver_to_seller",
    DELIVER_TO_BUYER = "deliver_to_buyer",
}
export enum InventoryMovementStatusView {
    COMPLETED = "Selesai",
    REJECTED = "Ditolak",
    CANCELLED = "Dibatalkan",
    DELIVER_TO_SELLER = "Dikirim ke penjual",
    DELIVER_TO_BUYER = "Dikirim ke pembeli",
}

export type InventoryMovement = {
    id: string;
    movement_id: string;
    product_name: string,
    product_photo: string,
    product_id: string;
    quantity: number;
    before_stok: number,
    after_stok:number,
    unit_id: string|null;
    unit_name: string|null;
    created_at: string;
    updated_at: string;
    amount: number;
    total_amount: number;
    status: InventoryMovementStatus;
    note: string | null;
    sku?: string;
    reference: string | null;
    reference_id: string | null;
    inventory_id: string;
    type: string;
    inventory: Inventory;
    item: Item;
    mutation_history: InventoryMovement[],
    cost: number|null,
    location_id_from?: string,
    location_from?: string,
    location_id_to?: string,
    location_to?: string,
    created_by?: string,
    user?: User,
    
}