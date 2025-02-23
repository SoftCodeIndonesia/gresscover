import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
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
import {PlusOutlined, ReloadOutlined, SettingFilled} from '@ant-design/icons';
import { Button, message, Space, Table, Pagination as AntPagination, Dropdown, Tag, Popconfirm } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
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
        request_column_relation: [],
        limit: 10,
        page: 1,

    });

    const showStatus = (_: any, record: ExchangeType, index: number) => {
        if(record.status == 'deliver_to_seller'){
            return <Tag color="processing">SEDANG DIKIRIM KE PENJUAL</Tag>;
        }else if(record.status == 'deliver_to_buyer'){
            return <Tag color="processing">SEDANG DIKIRIM KE PEMBELI</Tag>;
        }else if(record.status == 'completed'){
            return <Tag color="success">SELESAI</Tag>
        }
    }

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
            title: 'Status',
            dataIndex:'status', 
            key: 'status',
            render: showStatus,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: ExchangeType) => (
                <>
                  <Dropdown menu={{
                    items:[
                        {
                          key: '1',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'deliver_to_seller'} label="Dikirim ke penjual" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'deliver_to_seller')} onCancel={() => {}} />
                          ),
                          disabled: item.status == 'deliver_to_seller',
                         
                        },
                        {
                          key: '2',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'deliver_to_buyer'} label="Dikirim ke pembeli" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'deliver_to_buyer')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'deliver_to_buyer',
                        },
                        {
                          key: '3',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'completed'} label="Selesai" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'completed')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'completed',
                        },
                        {
                            key: '4',
                            label: (
                              <Button type="link" href="penjualan/add" onClick={() => handleEdit(item)} >Edit</Button>
                            ),
                            onClick:() => handleEdit(item),
                        },
                        {
                            key: '5',
                            label: (
                                <DeleteButton label='Hapus' onComfirm={() => handleDelete([item.exchange_id!])} okText='Hapus' cancelText='Batal' />
                            ),
                        },
                    ]
                }}>
                    <SettingFilled />
                </Dropdown>
                </>
              ),
        },
    ];

    const handleUpdateStatus = async (record: ExchangeType[], status: string) => {
       
        setLoading(true);
        try {

            const data: {
                exchange_id: string,
                status: string,
            }[] = record.map((value) => ({
                "exchange_id": value.exchange_id,
                "status": status,
            }))

            console.log(data);
            
            const response = await axiosInstance.put(`/exchange/status`, {data: data});

            if(response.status == 200){
                message.success('Berhasil!');
                getData(requestParam);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = (data: ExchangeType) => {
        console.log(data);
        setCookie('exchange', data.exchange_id);
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

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ExchangeType> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    

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
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Penukarang barang?"
                    description="Data yang sudah dihapus tidak bisa di pulihkan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Table columns={columns} loading={loading} rowSelection={rowSelection} pagination={false} dataSource={data?.data ?? []} rowKey={(record) => record.exchange_id} />
            <div className="flex my-3 justify-end">
            <AntPagination onChange={onChangePagination} defaultCurrent={data?.current_page} total={data?.total} />
            </div>
        </DashboardLayout>
    );
}

export default ExchangePage;