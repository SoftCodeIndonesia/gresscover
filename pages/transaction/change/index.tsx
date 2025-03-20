import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import EditButton from "@/pages/component/EditButton";
import ViewButton from "@/pages/component/ViewButton";
import { ExchangeType } from "@/type/exchange";
import { Pagination } from "@/type/pagination";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate, getStartAndEndOfMonth } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import {FileExcelFilled, PlusOutlined, ReloadOutlined, SearchOutlined, SettingFilled} from '@ant-design/icons';
import { Button, message, Space, Table, Pagination as AntPagination, Dropdown, Tag, Popconfirm, Input, Select, TableProps, DatePicker, TimeRangePickerProps, TableColumnsType, Row, Col, Statistic, Card } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { deleteCookie, setCookie } from "cookies-next";
import dayjs from "dayjs";
import Link from "next/link";
import router from "next/router";
import { Key, useEffect, useState } from "react";

type OnChange = NonNullable<TableProps<ExchangeType>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;

const ExchangePage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Pagination<ExchangeType>>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setRequestParam] = useState<NewRequestParam>({
        table: 'exchange',
        request_column: [],
        limit: 10,
        page: 1,

    });

    const [summery, setSummery] = useState<{total_item: number, total_amount: number}>({total_amount: 0, total_item: 0});
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const showStatus = (_: any, record: ExchangeType, index: number) => {
        if(record.status == 'deliver_to_seller'){
            return <Tag color="warning">SEDANG DIKIRIM KE PENJUAL</Tag>;
        }else if(record.status == 'deliver_to_buyer'){
            return <Tag color="processing">SEDANG DIKIRIM KE PEMBELI</Tag>;
        }else if(record.status == 'completed'){
            return <Tag color="success">SELESAI</Tag>
        }
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const onExport = async () => {
        const request = {...requestParam};
        
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/exchange_all', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rekap_penukaran_${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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

    const columns: TableColumnsType<ExchangeType> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            render: (_: any, record: ExchangeType, index: number) => index + 1,
        },
        
        {
            title: 'No Penukaran',
            dataIndex: 'exchange_number',
            key: 'exchange_number', 
            render: (_: any, record: ExchangeType, index: number) => <Link href={`change/${record.exchange_id}`} className="text-blue-500">#{record.exchange_number}</Link>,
        },
        {
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
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
            title: 'Jumlah Produk',
            dataIndex:'total_items', 
            key: 'total_items',
            sorter: true,
            render: (_: any, record: ExchangeType, index: number) => <p >{record.total_items}</p>,
        },
        {
            title: 'Total Produk',
            dataIndex:'total_price', 
            key: 'total_price',
            sorter: true,
            render: (_: any, record: ExchangeType, index: number) => <p >{formatRupiah(record.total_price!)}</p>,
        },
        {
            title: 'Biaya Pengiriman',
            dataIndex:'delivery_fee', 
            key: 'delivery_fee',
            sorter: true,
            render: (_: any, record: ExchangeType, index: number) => (formatRupiah(record.delivery_fee!)),
        },
        {
            title: 'Status',
            dataIndex:'status', 
            key: 'status',
            render: showStatus,
            onFilter: (value: boolean | Key, record: ExchangeType) => {                
                return true;
            },
            filters: [
                {text: 'Dikirim ke penjual', value: 'deliver_to_seller'},
                {text: 'Dikirim ke pembeli', value: 'deliver_to_buyer'},
                {text: 'Selesai', value: 'completed'},
            ],
            filterSearch: true,
        },
        {
            title: 'Dibuat Tgl',
            dataIndex:'created_at', 
            key: 'created_at',
            sorter: true,
        },
        {
            title: 'Terkahir di ubah',
            dataIndex:'updated_at', 
            key: 'updated_at',
            sorter: true,
        },
        {
            title: 'Dibuat oleh',
            dataIndex:'created_by', 
            key: 'created_by',
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
                              <Button type="link" href="change/add" onClick={() => handleEdit(item)} >Edit</Button>
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
                setSelectedRowKeys([]);
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
        
        setCookie('exchange', data.exchange_id);
        
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

    const getData = async (request: NewRequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/exchange_all', request);

            if(response.status == 200){
                setData(response.data.data.data);
                setSummery(response.data.data.summery);
                setSelectedRowKeys([]);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
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
        getData(request);
    }

    const onChangePagination = (page: number) => {
        const request = requestParam;
        request.page = page,
        setRequestParam(request);

        getData(request);
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearch = (query: string) => {
        const request = requestParam;
        request.keyword = query;
        setRequestParam(requestParam);
        getData(request);
    }

    const rowSelection: TableRowSelection<ExchangeType> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const handelShowRecord = (query: string) => {
        const request = {...requestParam};
        request.limit = parseInt(query);
        setRequestParam(request);
        getData(request);
    }

    const onChange: TableProps<ExchangeType>['onChange'] = (pagination, filters, sorter, extra) => {
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

        console.log(request);

        setRequestParam(request);
        getData(request)
    }

    const onChangeStatusBulk = async (e: string) => {
        handleUpdateStatus(selectedRowKeys.map((value) => ({exchange_id: value} as ExchangeType)), e);
    }
    

    useEffect(() => {
        const request = {...requestParam};
        request.where = {...request.where, ...{
            created_at: ['between', [currentStartDate, currentEndDate]]
        }}
        setRequestParam(request);
        getData(request);
    }, [])
    
    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="primary" href="change/add" onClick={() => {
                    deleteCookie('exchange');
                }} >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default"  onClick={() => getData(requestParam)} >Reload</Button>
                {selectedRowKeys.length > 0 && <Space>
                    <Popconfirm
                    title="Yakin Ingin Menghapus Data Penukarang barang?"
                    description="Data yang sudah dihapus tidak bisa di pulihkan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>
                
                <Select
                        placeholder="Ubah Status"
                        onChange={onChangeStatusBulk}
                        options={[
                            { value: 'deliver_to_seller', label: 'Dikirim ke penjual' },
                            { value: 'deliver_to_buyer', label: 'Dikirim ke pembeli' },
                            { value: 'completed', label: 'Selesai' },
                        ]}
                        allowClear
                    >
                            </Select>
                </Space>
                }
            </Space>
            <Row gutter={16} className="my-8">
                <Col span={12}>
                    <Card><Statistic title="Total Penukaran" value={formatRupiah(summery.total_amount)} loading={loading} /></Card>
                </Col>
               
                <Col span={12}>
                    <Card><Statistic title="Total Barang Di Tukar" value={summery.total_item} loading={loading} /></Card>
                </Col>
            </Row>
            <Space className="flex gap-3 items-center mb-4">
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
                    <Input placeholder="Cari Penukaran Barang" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table columns={columns} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} scroll={{ x: 'max-content'}} loading={loading} rowSelection={rowSelection} pagination={false} dataSource={data?.data ?? []} rowKey={(record) => record.exchange_id} />
            <div className="flex my-3 justify-end">
            <AntPagination onChange={onChangePagination} defaultCurrent={data?.current_page} total={data?.total} />
            </div>
        </DashboardLayout>
    );
}

export default ExchangePage;