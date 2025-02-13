import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import { RequestParam } from "@/type/request_param";
import { Retur } from "@/type/retur";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Button, message, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import {
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import axiosInstance from "@/utils/axiosInstance";
import { Pagination } from "@/type/pagination";
import { formatRupiah } from "@/utils/format_rupiah";
const ReturPage: React.FC = () => {
    const [requestParam, setRequestParam] = useState<RequestParam>({
        table: 'retur',
        request_column: ["retur_id","retur_number", "delivery_number", "status", "delivery_fee", "type"],
        request_column_relation: [],
        limit: 10,
        page: 1,

    });

    const [returs, setRetur] = useState<Pagination<Retur>>();
    const [loading, setLoading] = useState<boolean>(false);


    const showStatus = (_: any, record: Retur, index: number) => {
        if(record.status == 'draft'){
            return <Tag color="default">DRAFT</Tag>;
        }else if(record.status == 'proses pengembalian'){
            return <Tag color="processing">PROSES PENGEMBALIAN</Tag>;
        }else if(record.status == 'selesai'){
            return <Tag color="success">SELESAI</Tag>
        }
    }

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: Retur, index: number) => <p>{index + 1}</p>,
        },
        {
            title: 'No Retur',
            dataIndex: 'retur_number',
            key: 'retur_number',
            render: (_: any, record: Retur, index: number) => <p>#{record.retur_number}</p>,
        },
        {
            title: 'Type',
            dataIndex:'type', 
            key: 'type',
            render: (_: any, record: Retur, index: number) => <p>{capitalizeEachWord(record.type)}</p>,
        },
        {
            title: 'Nomor Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            
        },
        {
            title: 'Biaya Pengiriman',
            dataIndex:'delivery_fee', 
            key: 'delivery_fee',
            render: (_: any, record: Retur, index: number) => <p>{formatRupiah(record.delivery_fee)}</p>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: showStatus,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Retur) => (
                <>
                  <DeleteButton disable={item.status != 'draft'} label='Hapus' onComfirm={() => handleDelete(item)} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    const handleDelete = (data: Retur) => {
    
    }

    const getRetur = async () => {
        setLoading(true);
        try {
            const request: RequestParam = {
                table: 'retur',
                request_column: ["retur_id","retur_number", "delivery_number", "status", "delivery_fee", "type"],
                request_column_relation: [],
                limit: 10,
                page: 1,
            };
            const response = await axiosInstance.post('/search', request);

            if(response.status == 200){
                setRetur(response.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getRetur();
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="primary" href="retur/add_retur" className="my-3 bg-blue-600 text-white" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={getRetur} className="my-3" >Reload</Button>
            </Space>
            <Table columns={columns} loading={loading} dataSource={returs?.data ?? []} pagination={false} rowKey={(record) => record.retur_id} />
        </DashboardLayout>
    )
}

export default ReturPage;