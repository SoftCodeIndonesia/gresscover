import DashboardLayout from "@/pages/component/DashboardLayout";
import { Button, Space } from "antd";
import {
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';

const Transaction: React.FC = () => {
    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="link" href="penjualan/add" className="my-3 bg-blue-600 text-white" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => {}} className="my-3" >Reload</Button>
            </Space>
            <div>Transaction</div>
        </DashboardLayout>
    );
}

export default Transaction;