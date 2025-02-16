import { useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Image, Space, Table, Typography, message } from "antd";
import {
    DeleteFilled,
    EditFilled,
    EyeFilled,
    PlusCircleFilled,
    PlusCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import Title from "antd/es/typography/Title";
import { deleteCookie, setCookie } from "cookies-next";
import { useRouter } from "next/router";
import Link from "next/link";
const BarangKeluar: React.FC = () => {
    const router = useRouter();
    const [outs, setData] = useState<Pagination<InventoryMovement>>({
        current_page: 0,
        data: [],
        last_page: 1,
        total: 0,
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'inventory_movements',
        limit: 10,
        page: 1,
        where: [{
            type: 'out',
        }],
        request_column_relation: ['inventory', 'item', 'item.parent', 'inventory.location']
    });

    const column = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Item',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <Link href={`/items/${record.product_id}`} passHref>{record.item.sku}</Link>
        },
        {
            title: 'Quantity',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity} {record.unit_name}</p>
        },
        {
            title: 'Keluar Dari',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.inventory.location?.name}</p>
        },
        {
            title: 'Catatan',
            dataIndex: 'note',
            key: 'note',
            
        },
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: InventoryMovement) => (
                <Space className="gap-3">
                    <Link href={`/staff/${record.product_id}`}>
                        <EyeFilled className="text-blue-500"/>
                    </Link>
                    <Link href={`out/add`} className="text-yellow-500" onClick={(e) => {
                        setCookie('movement', record);
                    }} >
                            <EditFilled/>
                    </Link>
                    <Link href={`/staff/${record.product_id}`} className="text-red-500">
                            <DeleteFilled/>
                    </Link>
                </Space>

            ),
        },
    ]

    const fetch = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);

                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleNewInventory = () => {
        deleteCookie('movement')
        router.push('out/add');
    }


    useEffect(() => {
        fetch();
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Barang Keluar</Title>
            <Space className="flex gap-3">
                <Button icon={<PlusCircleOutlined/>} onClick={handleNewInventory}  type="primary" className="my-3" >Buat Barang Keluar</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={fetch} className="my-3" >Reload</Button>
            </Space>
            <Table columns={column} dataSource={outs!.data} pagination={false} rowKey={(record) => record.id} loading={loading} />
        </DashboardLayout>
    );
}

export default BarangKeluar;