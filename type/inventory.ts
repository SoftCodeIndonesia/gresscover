import { Item } from "./item"
import { User } from "./user"
import {Location} from "./location";

export type Inventory = {
    inventory_id: string,
    item: Item,
    location_id: string,
    location: Location | null,
    quantity: number,
    minimum_stock: number,
    price: number,
    created_at: string,
    upadated_at: string,
    created_by: User | null,
}