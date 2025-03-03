import { Inventory } from "./inventory";
import { InventoryMovement } from "./inventory_movement";
import { Sale, SaleItem } from "./sale";

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
    items: ExchangeItem[],
    total_items?: number,
    total_price?: number,
};

export type ExchangeItem = {
    exchange_item_id: string;
    exchange_id: string;
    quantity: number;
    price: number;
    total_price: number;
    sales_item_id: string;
    change_movement_id: string;
    movement_in: string;
    item_change_condition: string;
    product_name: string;
    product_photo: string | null;
    location_name: string;
    unit_name: string;
    inventory_id_from: string;
    inventory_id_exchange: string;
    movement: InventoryMovement; // Jika tipe data movement bisa berubah, ganti `null` dengan tipe yang sesuai
    inventory_from: Inventory; // Jika tipe data inventory_from bisa berubah, ganti `null` dengan tipe yang sesuai
    inventory_to: Inventory; // Jika tipe data inventory_to bisa berubah, ganti `null` dengan tipe yang sesuai
    sale_item: SaleItem|null,
  };
