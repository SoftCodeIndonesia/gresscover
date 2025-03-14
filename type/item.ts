import { Category } from "./category";
import { ProductImage } from "./product_image";
import { User } from "./user";

  
export type Item = {
    product_id: string;
    photo: string;
    name: string;
    category_id: string;
    category_name: string;
    sku: string;
    barcode: string;
    price: string;
    cost: string;
    stock_quantity: number;
    min_stock_quantity: number;
    created_by: number;
    user_name?: string;
    unit_id: string;
    unit_name: string;
    created_at: string;
    updated_at: string;
    category: Category;
    unit: ItemUnit|null,
    parent_id: string|null,
    sku_induk?: string|null,
    parent: Item|null,
    overall_quantity?: number,
    children: Item[],
    user?: User,
    product_images?: ProductImage[],
};

export type ItemUnit = {
    type_id: string,
    slug: string,
    name: string,
    max_value: number|null,
}