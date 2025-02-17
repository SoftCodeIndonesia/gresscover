import { useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Image, Pagination as PaginationTable, Space, Table, Typography, message } from "antd";
import {
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import Title from "antd/es/typography/Title";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/date_utils";
import EditButton from "@/pages/component/EditButton";
import ViewButton from "@/pages/component/ViewButton";
import DeleteButton from "@/pages/component/DeleteButton";
import { setCookie } from "cookies-next";
import { TableRowSelection } from "antd/es/table/interface";
const BarangMasuk: React.FC = () => {
    const router = useRouter();
    const [outs, setData] = useState<Pagination<InventoryMovement>>({
        current_page: 0,
        data: [],
        last_page: 1,
        total: 0,
    });
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'inventory_movements',
        limit: 10,
        page: 1,
        where: [
            {
                type: ['=', 'in'],
            },
            {
                type: ['=', 'adjustment'],
            },
        ],
        request_column_relation: ['inventory','inventory.location']
    });

    const column = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => <p>{(outs.current_page - 1) * 10 + index + 1}</p>,
        },
        // {
        //     title: 'Photo',
        //     dataIndex:'photo', 
        //     key: 'photo',
        //     render: (_: any, record: InventoryMovement) => record.item?.photo != null ? <Image
        //         width={40}
        //         src={`${process.env.NEXT_PUBLIC_BE}/storage/${record.item?.photo}`}
        //         fallback="data:image/png;base64,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"
        //     /> : '',
        // },
        // {
        //     title: 'SKU',
        //     dataIndex: '',
        //     key: 'sku',
        //     render: (_: any, record: InventoryMovement, index: number) => <p>
        //         <Typography.Link href="/">{record.}</Typography.Link>
        //     </p>
        // },
        {
            title: 'Product',
            dataIndex: '',
            key: 'item',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.product_name}</p>
        },
        {
            title: 'Sumber',
            dataIndex: '',
            key: '',
            render: (_: any, record: InventoryMovement, index: number) => checkSource(record),
        },
        {
            title: 'Quantity',
            dataIndex: '',
            key: 'quantity',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity} {record.unit_name}</p>
        },
        {
            title: 'Gudang',
            dataIndex: '',
            key: 'gudang',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.inventory?.location?.name ?? ''}</p>
        },
        {
            title: 'Tanggal',
            dataIndex: '',
            key: 'tanggal',
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatDate(record.created_at)}</p>
        },
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: InventoryMovement) => (
                <>
                    <EditButton label='' href="in/add" onClick={() => setCookie('movement_id', [record.id])}/>
                    <ViewButton label=''  href={`/inventory/in/${record.id}`} />
                    <DeleteButton label='' onComfirm={() => handleDelete([record.id])} okText='Hapus' cancelText='Batal' />
                </>
            ),
        },
    ]

    const checkSource = (source: InventoryMovement) => {
        
        switch (source.reference) {
            case 'inventory':
                return <p>Mutasi</p>
            case 'retur':
                return <p>Retur</p>
            case 'exchange':
                return <p>Penukaran barang</p>
            default:
                return <p>-</p>
        }
        
    }

    const handleEdit = (ids: String[]) => {
        const inventory_id = setCookie('movement_id', ids);
        // router.push('/inventory/add');
    }

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

    const paginateClick = (value: number) => {
        const request = {...requestParam};
        request.page = value;
        fetch(request);
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };
    
    const rowSelection: TableRowSelection<InventoryMovement> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    useEffect(() => {
        fetch(requestParam);
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Barang Masuk</Title>
            <Space className="gap-3">
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch(requestParam)} className="my-3" >Reload</Button>
                <Button icon={<PlusOutlined/>} type="primary" onClick={() => router.push('/inventory/add')} className="my-3" >Tambah</Button>
            </Space>
            <Table columns={column} dataSource={outs!.data} rowSelection={rowSelection} pagination={false} rowKey={(record) => record.id} loading={loading} />
            <div className="flex justify-end my-4">
            <PaginationTable onChange={paginateClick} defaultCurrent={outs.current_page} total={outs.total} />
            </div>
        </DashboardLayout>
    );
}

export default BarangMasuk;