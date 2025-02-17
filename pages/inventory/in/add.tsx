import AddInventory from "@/pages/component/AddInventory";
import DashboardLayout from "@/pages/component/DashboardLayout";
import { Breadcrumb } from "antd";

const AddMovementIn = () => {
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
                            title: 'Daftar Barang Masuk',
                            href: '/inventory/in',
                            
                        },
                        {
                            title: `Tambah Barang Masuk`,
                        }
                    ]}
                />}
            />
        </DashboardLayout>
    )
}

export default AddMovementIn;