import { InventoryMovement } from "./inventory_movement";
import { User } from "./user";

export type Movement = {
    movement_id: string;
    type: "in" | "out"; // Asumsi bahwa "type" hanya bisa "in" atau "out"
    location_name: string;
    location_id: string,
    created_by: string;
    created_at: string; // Format tanggal sebagai string
    updated_at: string; // Format tanggal sebagai string
    total_amount: number;
    total_selling_price: number;
    total_buying_price: number;
    date: string; // Format tanggal sebagai string
    total_item: number;
    is_payment: "Belum Lunas" | "Lunas" | number; // Asumsi bahwa status pembayaran hanya dua kemungkinan
    payment_date: string; // Format tanggal sebagai string
    items: InventoryMovement[],
    user?: User,
    total_sku?: number,
};