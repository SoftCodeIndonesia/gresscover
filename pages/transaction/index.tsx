
import { useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Input, Space, Tag, Typography } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";
import { DeleteButton, EditButton } from "../component/ButtonComponent";
import DashboardLayout from "../component/DashboardLayout";

import {
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { FormLayout } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { formatRupiah } from "@/utils/format_rupiah";
import { Pagination } from "@/type/pagination";
import { TransactionType } from "@/type/transcation";
import { RequestParam } from "@/type/request_param";
import { setCookie } from "cookies-next";


const Transaction: React.FC = () => {
    const [transaction, setTransaction] = useState<Pagination<TransactionType>>();
    const [requestParam, setRequestParam] = useState<RequestParam>({
        table: 'transaction',
        request_column: ['unique_id', 'type', 'reference', 'reference_id','status', 'total_amount'],
        request_column_relation: [],
        limit: 10,
        page: 1,

    });
    const [loading, setLoading] = useState<boolean>(false);

    const showStatus = (_: any, record: TransactionType, index: number) => {
        if(record.status == 'draft'){
            return <Tag color="default">DRAFT</Tag>;
        }else if(record.status == 'pending'){
            return <Tag color="processing">PENDING</Tag>;
        }else if(record.status == 'completed'){
            return <Tag color="success">SELESAI</Tag>
        }else{
            return <Tag color="warning">BATAL</Tag>;
        }

      
    }

    const showReference = (_: any, record: TransactionType, index: number) => {
        console.log(record);
        if(record.reference == 'sales'){
            return <Typography.Link href={`/penjualan/detail/${record.reference_id}`}>Penjualan</Typography.Link>
        }else{
            return <p>-</p>
        }

      
    }

    const columns = [
        {
            title: 'No Transaction',
            dataIndex: 'unique_id',
            key: 'unique_id',
            render: (_: any, record: TransactionType, index: number) => <p>#{record.unique_id}</p>,
        },
        {
            title: 'Type',
            dataIndex:'type', 
            key: 'type',
            render: (_: any, record: TransactionType, index: number) => <p className={record.type == 'expense' ? 'text-red-500' : 'text-green-500'}>{record.type == 'expense' ? 'Pengeluaran' : "Pemasukan"}</p>,
        },
        {
            title: 'Sumber',
            dataIndex:'reference', 
            key: 'reference',
            render: showReference,
        },
        {
            title: 'Status',
            dataIndex:'status', 
            key: 'status',
            render: showStatus,
        },
        {
            title: 'Total',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (_: any, record: TransactionType, index: number) => <p>{formatRupiah(record.total_amount)}</p>
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: TransactionType) => (
                <>
                  <EditButton disable={item.status != 'draft'} label='Edit' onClick={() => handleEdit(item)}/>
                  <DeleteButton disable={item.status != 'draft'} label='Hapus' onComfirm={() => handleDelete(item)} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    
    
    const handleEdit = (data: TransactionType) => {
         setCookie('tr_id', data.unique_id);
         window.location.href = 'transaction/add';
    }

    const handleDelete = (data: TransactionType) => {

    }

    

    const handleSubmit = async (values: any) => {

    }

    const getTransactions = async () => {
        setLoading(true);
        try {
            const request: RequestParam = {
                table: 'transaction',
                request_column: ['unique_id', 'type', 'reference','reference_id','status', 'total_amount'],
                request_column_relation: [],
                limit: 10,
                page: 1,
        
            };
            const response = await axiosInstance.post('/search', request);

            if(response.status == 200){
                setTransaction(response.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        getTransactions();
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
            <Button icon={<PlusOutlined/>} type="primary" href="transaction/add" className="my-3 bg-blue-600 text-white" >Tambah</Button>
            <Button icon={<ReloadOutlined/>} type="default" onClick={getTransactions} className="my-3" >Reload</Button>
            </Space>
            <Table columns={columns} loading={loading} dataSource={transaction?.data ?? []} rowKey={(record) => record.unique_id} />
        </DashboardLayout>
    );
};


export default Transaction;
