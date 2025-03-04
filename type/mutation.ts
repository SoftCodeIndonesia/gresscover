import { InventoryMovement } from "./inventory_movement";
import { Item } from "./item";
import { User } from "./user";

export type Mutation = {
    mutation_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    items: MutationItem[];
    created_at: string;
    updated_at: string;
    location?: string;
    barcode?: string;
    product?: Item;
    user?: User;
  };
  
  export type MutationItem = {
    mutation_item_id: string;
    mutation_id: string;
    movement_id: string;
    product_name: string;
    product_id: string;
    sku: string;
    quantity: number;
    from_name: string;
    from_id: string;
    to_name: string;
    to_id: string;
    unit_id: string;
    unit_name: string;
    created_at: string;
    updated_at: string;
    movement?: InventoryMovement,
  };
  