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
import DeleteButton from "@/pages/component/DeleteButton";
const BarangKeluar: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
        where: [
            {
                type: ['=', 'out'],
            },
            {
                type: ['=', 'mutation'],
            },
            {
                type: ['=', 'sales'],
            },
            {
                type: ['=', 'exchange'],
            },
        ],
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
            render: (_: any, record: InventoryMovement, index: number) => <Link href={`/items/${record.product_id}`} passHref>{record.inventory.product_name}</Link>
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
                    <Link href={`out/add`} className="text-yellow-500" onClick={(e) => {
                        setCookie('movement', record);
                    }} >
                            <EditFilled/>
                    </Link>
                    <Link href={`/inventory/out/${record.id}`}>
                        <EyeFilled className="text-blue-500"/>
                    </Link>
                    <DeleteButton onClick={() => handleDelete([record.id])} label={""}></DeleteButton>
                </Space>

            ),
        },
    ]

    const handleDelete = async (ids: String[]) => {

        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/movement_del`, {"data": ids});
            if(response.status == 200){
                message.success('Item Telah Dihapus!');
                fetch(requestParam);
                setSelectedRowKeys([]);
            }else{
                message.error('Gagal Telah Dihapus!');
            }
        } catch (error) {
            message.error('Gagal Hapus Item!');
        } finally {
            setLoading(false);
        }
    }

    const fetch = async (request: RequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search', request);
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
        fetch(requestParam);
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Barang Keluar</Title>
            <Space className="flex gap-3">
                <Button icon={<PlusCircleOutlined/>} onClick={handleNewInventory}  type="primary" className="my-3" >Buat Barang Keluar</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch(requestParam)} className="my-3" >Reload</Button>
            </Space>
            <Table columns={column} dataSource={outs!.data} pagination={false} rowKey={(record) => record.id} loading={loading} />
        </DashboardLayout>
    );
}

export default BarangKeluar;