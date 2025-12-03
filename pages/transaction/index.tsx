
import { Key, useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Input, Space, Tag, Typography, Pagination as AntPagination, Popconfirm, Select, DatePicker, TableProps, TimeRangePickerProps, TableColumnsType, Row, Col, Statistic, Card } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";
import EditButton from '../component/EditButton';
import DeleteButton from '../component/DeleteButton';
import DashboardLayout from "../component/DashboardLayout";

import {
    ReloadOutlined,
    PlusOutlined,
    FileExcelFilled,
    SearchOutlined
} from '@ant-design/icons';
import { FormLayout } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { formatRupiah } from "@/utils/format_rupiah";
import { Pagination } from "@/type/pagination";
import { TransactionType } from "@/type/transcation";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import { setCookie } from "cookies-next";
import { TableRowSelection } from "antd/es/table/interface";
import { getStartAndEndOfMonth } from "@/utils/date_utils";
import { ExchangeType } from "@/type/exchange";
import dayjs from "dayjs";

type OnChange = NonNullable<TableProps<ExchangeType>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;

const Transaction: React.FC = () => {
    const [summery, setSummery] = useState<{total_pemasukan: number, total_pengeluaran: number}>({total_pemasukan: 0, total_pengeluaran: 0});
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const [transaction, setTransaction] = useState<Pagination<TransactionType>>();
    const [requestParam, setRequestParam] = useState<NewRequestParam>({
        table: 'transaction',
        request_column: ['unique_id', 'type', 'reference','reference_id','status', 'total_amount'],
        limit: 10,
        page: 1,
        orderBy: {
            created_at: 'DESC'
        },
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

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const showReference = (_: any, record: TransactionType, index: number) => {
        console.log(record);
        if(record.reference == 'sales'){
            return <Typography.Link href={`transaction/penjualan/${record.reference_id}`}>{'Penjualan'}</Typography.Link>
        }else if(record.reference == 'retur'){
            return <Typography.Link href={`transaction/retur/${record.reference_id}`}>{'Retur'}</Typography.Link>
        }else if(record.reference == 'exchange'){
            return <Typography.Link href={`transaction/change/${record.reference_id}`}>{'Penukaran'}</Typography.Link>
        }else{
            return <p>-</p>
        }

      
    }

    const columns: TableColumnsType<TransactionType> = [
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
            onFilter: (value: boolean | Key, record: TransactionType) => {
                                                    
                return true;
            },
            filters: [
                {text: 'Pemasukan', value: 'income'},
                {text: 'Pengeluaran', value: 'expense'},
            ],
        },
        {
            title: 'Sumber',
            dataIndex:'reference', 
            key: 'reference',
            render: showReference,
            onFilter: (value: boolean | Key, record: TransactionType) => {
                                                    
                return true;
            },
            filters: [
                {text: 'Penjualan', value: 'sales'},
                {text: 'Retur', value: 'retur'},
                {text: 'Penukaran', value: 'exchange'},
            ],
        },
        {
            title: 'Status',
            dataIndex:'status', 
            key: 'status',
            render: showStatus,
            onFilter: (value: boolean | Key, record: TransactionType) => {
                                                    
                return true;
            },
            filters: [
                {text: 'Pending', value: 'pending'},
                {text: 'Selesai', value: 'completed'},
                {text: 'Batal', value: 'cancel'},
            ],
        },
        {
            title: 'Total Sebelum Potongan',
            dataIndex: 'total_amount_before_tax',
            key: 'total_amount_before_tax',
            sorter: true,
            render: (_: any, record: TransactionType, index: number) => <p>{formatRupiah(record.total_amount_before_tax)}</p>
        },
        {
            title: 'Total Setelah Potongan',
            dataIndex: 'total_amount_after_tax',
            key: 'total_amount_after_tax',
            sorter: true,
            render: (_: any, record: TransactionType, index: number) => <p>{formatRupiah(record.total_amount_after_tax)}</p>
        },
        {
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
        },
        {
            title: 'Catatan',
            dataIndex: 'text',
            key: 'text',
        },
        {
            title: 'Terakhir Di Ubah',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
        },
        {
            title: 'Dibuat Oleh',
            dataIndex: 'u.name',
            key: 'u.name',
            render: (_: any, record: TransactionType, index: number) => <p>{record.name}</p>
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: TransactionType) => (
                <>
                  <EditButton label='Edit' onClick={() => handleEdit(item)}/>
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

    const getTransactions = async (request: NewRequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/transaction_search', request);

            if(response.status == 200){
                setTransaction(response.data.data.data);
                setSummery(response.data.data.summery);
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
        const request = requestParam;
        request.page = page,
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

    const onExport = async () => {
        const request = {...requestParam};
        if(selectedRowKeys.length > 0){
            request.where = {
                unique_id: ["in", selectedRowKeys]
            }
        }
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/transaction_search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rekap_transaksi_${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
            document.body.appendChild(link);

            // Klik link untuk memulai download
            link.click();

            // Hapus link setelah download selesai
            document.body.removeChild(link);
        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onSearch = (query: string) => {
        const request =requestParam;
        request.keyword = query;
        setRequestParam(requestParam);
        getTransactions(request);
    }

    const onChangeRangePicker = (dates: [string, string]) => {
        
        var range: [string, string] = dates;

        if(dates[0] == '' && dates[1] == ''){
            const start = getStartAndEndOfMonth().startOfMonth;
            const end = getStartAndEndOfMonth().endOfMonth;
            range = [start, end];
        }else{
            range = [`${range[0]} 00:00:00`, `${range[1]} 23:59:00`];
        }

        setCurrentEndDate(range[1]);
        setCurrentStartDate(range[0]);
        const request = {...requestParam};
        
        request.where['created_at'] = ['between', range];
        setRequestParam(request);
        getTransactions(request);
    }

    const handelShowRecord = (query: string) => {
        const request = {...requestParam};
        request.limit = parseInt(query);
        setRequestParam(request);
        getTransactions(request);
    }

    const onChange: TableProps<TransactionType>['onChange'] = (pagination, filters, sorter, extra) => {
        // console.log('params', pagination, filters, sorter, extra);
        // console.log(sorter);

        const sort: Sorts = sorter as Sorts;
        
        const request = {...requestParam};
        if(sort.columnKey != undefined){
            request.orderBy = {
                [sort.columnKey.toString()]: sort.order == "ascend" ? 'ASC' : 'DESC' 
            }
        }
        var filterColumn = {};
        for(let column in filters){
            if(filters[column] != null){
                filterColumn = {...filterColumn, ...{
                    [column]: ['in', filters[column]],
                }};
            }
            
        }

        request.where = {...filterColumn, ...{
            created_at: ['between', [currentStartDate, currentEndDate]],
        }},

        setRequestParam(request);
        getTransactions(request)
    };

    useEffect(() => {
        const request = {...requestParam};
        request.where = {
            created_at: ['between', [currentStartDate, currentEndDate]],
        }
        setRequestParam(request);
        getTransactions(request);
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="primary" onClick={() => {
                    setCookie('tr_id', null);
                }} href="transaction/add" className=" bg-blue-600 text-white" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => getTransactions(requestParam)} className="" >Reload</Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Transaksi?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Row gutter={16} className="my-8" >
                <Col span={12} className="">
                    <Card><Statistic title="Total Pemasukan" valueStyle={{ color: '#3f8600' }} value={formatRupiah(summery.total_pemasukan)} loading={loading} /></Card>
                </Col>
               
                <Col span={12} className="">
                    <Card><Statistic title="Total Pengeluaran" valueStyle={{ color: '#cf1322' }} value={summery.total_pengeluaran} loading={loading} /></Card>
                </Col>
            </Row>
            <Space className="flex gap-3 mb-4 items-center">
                    <p className="font-normal">Filter : </p>
                    <RangePicker 
                        presets={[
                            {
                            label: <span aria-label="Current Time to End of Day">Now ~ EOD</span>,
                            value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                            },
                            ...rangePresets,
                        ]}
                        defaultPickerValue={[dayjs(currentStartDate), dayjs(currentEndDate)]}
                        defaultValue={[dayjs(currentStartDate), dayjs(currentEndDate)]}
                        onChange={(e, dateString) => onChangeRangePicker(dateString)} 
                    />
                    <Button type="default" icon={<FileExcelFilled/>} onClick={onExport}>Export Ke Excel</Button>
                    <Select
                        defaultValue="10"
                        style={{ width: 80 }}
                        onChange={(e) => handelShowRecord(e)}
                        options={[
                            { value: '10', label: '10' },
                            { value: '30', label: '30' },
                            { value: '50', label: '50' },
                            { value: '100', label: '100'},
                        ]}
                    />
                    <Input placeholder="Cari Data Transaksi" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table columns={columns} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} scroll={{ x: 'max-content'}} loading={loading} rowSelection={rowSelection} pagination={false} dataSource={transaction?.data ?? []} rowKey={(record) => record.unique_id} />
            <div className="flex my-3 justify-end">
            <AntPagination onChange={onChangePagination} defaultCurrent={transaction?.current_page} total={transaction?.total} />
            </div>
        </DashboardLayout>
    );
};


export default Transaction;
