import { Inventory } from "./inventory";
import { InventoryMovement } from "./inventory_movement";
import { Sale, SaleItem } from "./sale";

export type Retur = {
    retur_id: string;
    retur_number: string;
    sales_id: string;
    sales_number: string;
    delivery_number: string;
    status: string;
    type: string;
    delivery_fee: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    sales: Sale|null,
    items: ReturItem[];
    total_items: number;
    total_price: number;
};

export type ReturItem = {
    retur_item_id: string,
    retur_id: string,
    quantity: number,
    price: number,
    total_price: number,
    sales_item_id: string,
    retur_movement_id: string,
    item_retur_condition: string,
    product_name: string,
    product_photo: string,
    location_name: string,
    unit_name: string,
    inventory_id: string,
    inventory: Inventory|null,
    movement: InventoryMovement|null,
    sale_item: SaleItem|null,
    
}