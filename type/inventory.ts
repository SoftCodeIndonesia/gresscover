import { Item, ItemUnit } from "./item"
import { User } from "./user"
import {Location} from "./location";
import { InventoryMovement } from "./inventory_movement";
export type Inventory = {
    inventory_id: string,
    product_id?: string,
    product_name?: string,
    product_photo?: string,
    item: Item,
    location_id: string,
    location: Location | null,
    quantity: number,
    minimum_stock: number,
    price: number,
    cost: number,
    created_at: string,
    upadated_at: string,
    created_by: User | null,
    unit_id: string | null,
    unit_name: string | null,
    unit: ItemUnit | null,
    movements: InventoryMovement[]
}