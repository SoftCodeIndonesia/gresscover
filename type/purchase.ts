import { ItemUnit } from "./item";
import { QualityReport } from "./reportIssue";
import { Vendor } from "./vendor";



export type PurchaseOrderItem = {
  key?: string,
  id?: number;
  product_id: string;
  sku: string;
  product_name: string;
  variant_id: string;
  quantity: number;
  price: number;
  total: number;
  unit_id: string;
  unit_name: string;
  children: PurchaseOrderItem[],
  is_parent?:boolean;
  parentIndex?: number;
  originalIndex?: number;
  childIndex?: number;
  isChild?: boolean;
  isExpanded?: boolean;
  unit?: ItemUnit;
  is_variant?: boolean,
  has_variants?: boolean,
  action?: PurchaseOrderItemFormAction,
}
export type PurchaseOrderItemForm = {
  key?: string,
  id?: number;
  product_id: string;
  sku: string;
  product_name: string;
  variant_id: string;
  quantity: number;
  price: number;
  total: number;
  unit_id: string;
  unit_name: string;
  is_parent?:boolean;
  parentIndex?: number;
  originalIndex?: number;
  childIndex?: number;
  isChild?: boolean;
  isExpanded?: boolean;
  action: PurchaseOrderItemFormAction;
}

export enum PurchaseOrderItemFormAction {
  DELETE = 'delete',
  UPDATE = 'update',
  CREATE = 'create',
}

export type PaymentInfo = {
  bank: string;
  account_number: string;
  account_name: string;
}


export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  RECEIVED = 'received',
  COMPLETED = 'completed',
  CANCEL = 'cancel',
}

export type PurchaseOrder = {
  purchase_order_id?: number;
  vendor_id: number;
  vendor: Vendor;
  vendor_name?: string;
  payment_method: string|null;
  invoice_number: string;
  order_date: string;
  invoice_date: string | null;
  subtotal: number;
  additional_cost: number;
  discount_amount: number;
  ppn_amount: number;
  total_amount: number;
  due_date: string;
  payment: PaymentInfo;
  status: PurchaseOrderStatus;
  notes: string;
  items: PurchaseOrderItem[];
  created_at?: string;
  qualityReport?: QualityReport;
}