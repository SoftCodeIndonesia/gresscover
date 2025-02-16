import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import EditButton from "@/pages/component/EditButton";
import ViewButton from "@/pages/component/ViewButton";
import { ExchangeType } from "@/type/exchange";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import {PlusOutlined, ReloadOutlined} from '@ant-design/icons';
import { Button, message, Space, Table, Pagination as AntPagination } from "antd";
import { deleteCookie, setCookie } from "cookies-next";
import router from "next/router";
import { useEffect, useState } from "react";

const ExchangePage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Pagination<ExchangeType>>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setRequestParam] = useState<RequestParam>({
        table: 'exchange',
        request_column: [],
        request_column_relation: ["items", "items.inventory", "sales", "sales.items"],
        limit: 10,
        page: 1,

    });

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: ExchangeType, index: number) => index + 1,
        },
        
        {
            title: 'No Penukaran',
            dataIndex: 'exchange_number',
            key: 'exchange_number', 
            render: (_: any, record: ExchangeType, index: number) => <p>#{record.exchange_number}</p>,
        },
        {
            title: 'Tanggal',
            dataIndex: 'sale_date',
            key: 'sale_date',
            render: (_: any, record: ExchangeType, index: number) => <p>{formatDate(record.created_at!)}</p>,
        },
        {
            title: 'No Pesanan',
            dataIndex:'sales_number', 
            key: 'sales_number',
            // render: (_: any, record: ExchangeType, index: number) => <p >{formatRupiah(parseInt(record.total_amount ?? '0'))}</p>,
        },
        {
            title: 'No Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            render: (_: any, record: ExchangeType, index: number) => <p >{record.delivery_number}</p>,
        },
        {
            title: 'Biaya Pengiriman',
            dataIndex:'delivery_fee', 
            key: 'delivery_fee',
            render: (_: any, record: ExchangeType, index: number) => (formatRupiah(record.delivery_fee!)),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: ExchangeType) => (
                <>
                  {/* <EditButton label=''  onClick={() => handleEdit(item)}/> */}
                  <ViewButton label=''  onClick={() => router.push('inventory/' + item.exchange_id)}/>
                  <DeleteButton label='' onComfirm={() => handleDelete([item.exchange_id])} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    const handleEdit = (data: ExchangeType) => {
        console.log(data);
        setCookie('exchange', data);
        router.push('change/add');
    }

    const handleDelete = async (ids: String[]) => {

        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/exchange/del`, {"data": ids});
            if(response.status == 200){
                message.success('Item Telah Dihapus!');
                getData(requestParam);
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

    const getData = async (request: RequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search', request);

            if(response.status == 200){
                setData(response.data.data);
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
            table: 'exchange',
            request_column: [],
            request_column_relation: [],
            limit: 10,
            page: page,
    
        };
        setRequestParam(request);

        getData(request);
    }

    useEffect(() => {
        getData(requestParam);
    }, [])
    
    return (
        <DashboardLayout>
            <Space className="gap-3 my-3">
                <Button icon={<PlusOutlined/>} type="primary" href="change/add" onClick={() => {
                    deleteCookie('exchange');
                }} >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default"  onClick={() => getData(requestParam)} >Reload</Button>
            </Space>
            <Table columns={columns} loading={loading} pagination={false} dataSource={data?.data ?? []} rowKey={(record) => record.exchange_id} />
            <div className="flex my-3 justify-end">
            <AntPagination onChange={onChangePagination} defaultCurrent={data?.current_page} total={data?.total} />
            </div>
        </DashboardLayout>
    );
}

export default ExchangePage;