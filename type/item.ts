import { Category } from "./category";

  
export type Item = {
    product_id: string;
    photo: string;
    name: string;
    category_id: string;
    sku: string;
    barcode: string;
    price: string;
    cost: string;
    stock_quantity: number;
    min_stock_quantity: number;
    created_by: number;
    unit_id: string;
    unit_name: string;
    created_at: string;
    updated_at: string;
    category: Category;
    unit: ItemUnit|null,
    parent_id: string|null,
    parent: Item|null,
    children: Item[],
};

export type ItemUnit = {
    type_id: string,
    slug: string,
    name: string,
    max_value: number|null,
}