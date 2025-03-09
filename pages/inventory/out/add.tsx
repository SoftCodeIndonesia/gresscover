import React from "react";
import DashboardLayout from "@/pages/component/DashboardLayout";
import AddInventory from "@/pages/component/AddInventory";
import { Breadcrumb } from "antd";


interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    quantity: number|null, 
    movement_id?: string,
    sku: string|null,
    before_stok: number,
    after_stok:number, 
    selling_price: number|null, 
    selling_price_string: string|null, 
    cost: number|null, 
    cost_string: string|null, 
    minimum: number|null,
    checked: boolean,
    unit_id: string|null,
    unit_name: string|null,
    type?: string|null,
    note?: string,
    // children: TableInventory[],
}


const InventoryOut: React.FC = () => {
    
    return (
        <DashboardLayout>
            <AddInventory
                breadcrumb={<Breadcrumb
                    separator=">"
                    className="mb-12"
                    items={[
                        {
                            title: 'Home',
                        },
                        {
                            title: 'Daftar Barang Keluar',
                            href: '/inventory/out',
                            
                        },
                        {
                            title: `Tambah Barang Keluar`,
                        }
                    ]}
                />}
            />
        </DashboardLayout>
    );
}


export default InventoryOut;