import { Inventory } from "./inventory";
import { InventoryMovement } from "./inventory_movement";
import { Tax } from "./tax";

export type Sale = {
    sale_id: string|null;
    sale_date: string|null;
    withdrawal_date: string|null;
    total_amount: string|null;
    payment_method: string|null;
    created_at: string|null;
    updated_at: string|null;
    user_id: number|null;
    order_number: string|null;
    delivery_number: string|null;
    status: string|null;
    platform: string|null;
    total_amount_before_tax: number,
    total_amount_after_tax: number,
    user_name: string,
    items: SaleItem[],
    taxes: SaleTax[],
    total_tax?: number|null;
    status_vendor?: string;
    total_quantity?: number,
    total_sku?: number,
    has_retur?: number,
    quantity_retur?: number,
    total_harga_beli?: number,
    profit?: number,
    location_id: string|null,
    location_name: string|null,
}

export type SaleItem = {
    sale_item_id: string;
    sale_id: string;
    quantity: number;
    price: string;
    created_at: string;
    updated_at: string;
    total_price: number;
    movement_id: string;
    product_name: string;
    product_photo: string | null;
    location_name: string;
    unit_name: string;
    inventory_id: string;
    inventory: Inventory;
    movement: InventoryMovement;
    has_retur: number;
    quantity_retur: number;
    total_retur_qty?: number;
    total_exchange_qty?:number;

}

export type SaleTax = {
    sale_tax_id: string,
    tax_id: string,
    sale_id: string,
    name: string|null,
    value: number,
    unit_value: string|null,
    tax: Tax,
}