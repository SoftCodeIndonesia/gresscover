import { useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Image, Space, Table, Typography, message } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import Title from "antd/es/typography/Title";
const MutasiBarang: React.FC = () => {

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
            type: 'mutation',
        }],
        request_column: ["id","inventory_id","SUM(quantity) as quantity"],
        request_column_relation: ['inventory', 'inventory.item'],
        group: "inventory_id",
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
            key: '',
            render: (_: any, record: InventoryMovement, index: number) => <Typography.Link href={'/'}>{record.inventory?.item.name ?? ''}</Typography.Link>
        },
        {
            title: 'SKU',
            dataIndex: '',
            key: 'sku',
            render: (_: any, record: InventoryMovement, index: number) => <p>
                <Typography.Link href={'/'}>{record.inventory?.item.sku ?? ''}</Typography.Link>
            </p>
        },
        {
            title: 'Item',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.inventory.item.name}</p>
        },
        {
            title: 'Quantity',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity} {record.inventory.item?.unit_name}</p>
        },
        
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: InventoryMovement) => (
                <Typography.Link href={`/inventory/mutasi/${record.id}`}>
                        Lihat Rincian
                </Typography.Link>
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


    useEffect(() => {
        fetch();
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Mutasi</Title>
            <Space className="gap-2">
                <Button icon={<ReloadOutlined/>} type="default" onClick={fetch} className="my-3" >Reload</Button>
                <Button icon={<PlusOutlined/>} href="mutasi/add" type="primary" className="my-3" >Buat Mutasi</Button>
            </Space>
            <Table columns={column} dataSource={outs!.data} pagination={false} rowKey={(record) => record.id} loading={loading} />
        </DashboardLayout>
    );
}

export default MutasiBarang;