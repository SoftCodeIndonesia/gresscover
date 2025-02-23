
import { useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Input, Space, Tag, Typography, Pagination as AntPagination, Popconfirm } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";
import EditButton from '../component/EditButton';
import DeleteButton from '../component/DeleteButton';
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
import { TableRowSelection } from "antd/es/table/interface";


const Transaction: React.FC = () => {
    const [transaction, setTransaction] = useState<Pagination<TransactionType>>();
    const [requestParam, setRequestParam] = useState<RequestParam>({
        table: 'transaction',
        request_column: ['unique_id', 'type', 'reference','reference_id','status', 'total_amount'],
        request_column_relation: [],
        limit: 10,
        page: 1,

    });
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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
        }else if(record.reference == 'retur'){
            return <Typography.Link href={`/retur/detail/${record.reference_id}`}>Retur</Typography.Link>
        }else{
            return <p>-</p>
        }

      
    }

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: TransactionType, index: number) => <p>{index + 1}</p>,
        },
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
                  <DeleteButton label='Hapus' onComfirm={() => handleDelete([item.unique_id])} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    
    
    const handleEdit = (data: TransactionType) => {
         setCookie('tr_id', data.unique_id);
         window.location.href = 'transaction/add';
    }

    const handleDelete = async (ids: string[]) => {
        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/search_del`, {"table": 'transaction', "data": ids});
            if(response.status == 200){
                message.success('Item Telah Dihapus!');
                getTransactions(requestParam);
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

    

    const handleSubmit = async (values: any) => {

    }

    const getTransactions = async (request: RequestParam) => {
        setLoading(true);
        try {
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

    const onChangePagination = (page: number) => {
        const request = {
            table: 'transaction',
            request_column: ['unique_id', 'type', 'reference', 'reference_id','status', 'total_amount'],
            request_column_relation: [],
            limit: 10,
            page: page,
    
        };
        setRequestParam(request);

        getTransactions(request);
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<TransactionType> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    useEffect(() => {
        getTransactions(requestParam);
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="primary" href="transaction/add" className="my-3 bg-blue-600 text-white" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => getTransactions(requestParam)} className="my-3" >Reload</Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Inventory?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Table columns={columns} loading={loading} rowSelection={rowSelection} pagination={false} dataSource={transaction?.data ?? []} rowKey={(record) => record.unique_id} />
            <div className="flex my-3 justify-end">
            <AntPagination onChange={onChangePagination} defaultCurrent={transaction?.current_page} total={transaction?.total} />
            </div>
        </DashboardLayout>
    );
};


export default Transaction;
