import { Item } from "./item";
import { PurchaseOrder, PurchaseOrderItem } from "./purchase";
import { User } from "./user";

export type QualityReportList = {
    id: number;
    // unique_id?: string,
    purchase_order_id: number;
    invoice_number: string;
    vendor_name: string;
    inspection_date: string;
    inspected_by: number;
    receiver_name: string;
    total_received: number;
    total_defect: number;
    defect_percentage: string;
    action: string;
    action_note: string;
    created_at: string;
    updated_at: string;
    items_count: number;
    total_items_received: string;
    total_items_defect: string;
    vendor_email: string;
    vendor_phone: string;
    unique_id?: string;
    inspection_name?: string;
    inspector_signature?: string;
    vendor_signature?: string;
    created_by?: number;
    received_by?: number;
    purchase_order?: any;
    items?: any[];
};

export type QualityReportSummary = {
    total_reports: number;
    total_items_inspected: number;
    total_defect_items: number;
    avg_defect_percentage: number;
};

export type QualityReportItem = {
    id: number;
    quality_report_id: number;
    product_id: string;
    sku: string;
    product_name: string;
    defect_type: string;
    qty_defect: number;
    note: string | null;
    created_at: string;
    updated_at: string;
    received_quantity: number;
    good_quantity: number;
    order_item_id: number;
    order_item: PurchaseOrderItem;
    product?: Item,
}


export type QualityReport = {
    id: number;
    unique_id: string;
    purchase_order_id: number;
    inspection_date: string;
    receiver_name: string;
    inspection_name: string | null;
    total_received: number;
    total_defect: number;
    defect_percentage: string;
    action: 'accept' | 'reject' | 'discount' | 'return' | string;
    action_note: string | null;
    inspector_signature: string | null;
    vendor_signature: string | null;
    created_by: number;
    received_by: number;
    created_at: string;
    updated_at: string;
    inspected_by: number;
    purchase_order: PurchaseOrder;
    items: QualityReportItem[];
    inspector: User;
}