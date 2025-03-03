import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import { Retur } from "@/type/retur";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Button, Dropdown, Input, message, Popconfirm, Select, Space, Table, Tag, Pagination as AntPagination, Form, TableProps, DatePicker, TimeRangePickerProps, Row, Statistic, Card, Col, TableColumnsType } from "antd";
import { Key, useEffect, useState } from "react";
import {
    ReloadOutlined,
    PlusOutlined,
    SettingFilled,
    SearchOutlined,
    FileExcelFilled
} from '@ant-design/icons';
import axiosInstance from "@/utils/axiosInstance";
import { Pagination } from "@/type/pagination";
import { formatRupiah } from "@/utils/format_rupiah";
import { deleteCookie, setCookie } from "cookies-next";
import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import { useRouter } from "next/router";
import Link from "next/link";
import { TableRowSelection } from "antd/es/table/interface";
import { getStartAndEndOfMonth } from "@/utils/date_utils";
import dayjs from "dayjs";
import Title from "antd/es/typography/Title";

type OnChange = NonNullable<TableProps<Retur>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;

const ReturPage: React.FC = () => {
    const [requestParam, setRequestParam] = useState<NewRequestParam>({
        table: 'retur',
        request_column: ["retur_id","retur_number", "delivery_number", "status", "delivery_fee", "type"],
        limit: 10,
        page: 1,

    });

    const [form] = Form.useForm();

    const [returs, setRetur] = useState<Pagination<Retur>>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [summery, setSummery] = useState<{total_item: number, total_amount: number}>({total_amount: 0, total_item: 0});
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);


    const showStatus = (_: any, record: Retur, index: number) => {
        if(record.status == 'draft'){
            return <Tag color="default">DRAFT</Tag>;
        }else if(record.status == 'proses pengembalian'){
            return <Tag color="processing">PROSES PENGEMBALIAN</Tag>;
        }else if(record.status == 'selesai'){
            return <Tag color="success">SELESAI</Tag>
        }
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const columns: TableColumnsType<Retur> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            render: (_: any, record: Retur, index: number) => <p>{index + 1}</p>,
        },
        {
            title: 'No Retur',
            dataIndex: 'retur_number',
            key: 'retur_number',
            render: (_: any, record: Retur, index: number) => <Link href={`retur/${record.retur_id}`} ><p className="text-blue-500">#{record.retur_number}</p></Link>,
        },
        {
            title: 'No Pesanan',
            dataIndex: 'sales_number',
            key: 'sales_number',
            render: (_: any, record: Retur, index: number) => <Link href={`penjualan/${record.sales_id}`} ><p className="text-blue-500">{record.sales_number}</p></Link>,
        },
        {
            title: 'Type',
            dataIndex:'type', 
            key: 'type',
            onFilter: (value: boolean | Key, record: Retur) => {
                                        
                return true;
            },
            filters: [
                {text: 'Pengembalian', value: 'pengembalian'},
                {text: 'Pembatal Pembeli', value: 'pembatalan pembeli'},
            ],
            render: (_: any, record: Retur, index: number) => <p>{capitalizeEachWord(record.type)}</p>,
        },
        {
            title: 'Nomor Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            
        },
        {
            title: 'Jumlah Produk',
            dataIndex:'total_items', 
            key: 'total_items',
            sorter: true,
            render: (_: any, record: Retur, index: number) => <p >{record.total_items}</p>,
        },
        {
            title: 'Total Produk',
            dataIndex:'total_price', 
            key: 'total_price',
            sorter: true,
            render: (_: any, record: Retur, index: number) => <p >{formatRupiah(record.total_price!)}</p>,
        },
        {
            title: 'Biaya Pengiriman',
            dataIndex:'delivery_fee', 
            key: 'delivery_fee',
            sorter: true,
            render: (_: any, record: Retur, index: number) => <p>{formatRupiah(record.delivery_fee)}</p>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: showStatus,
            onFilter: (value: boolean | Key, record: Retur) => {
                                        
                return true;
            },
            filters: [
                {text: 'Proses Pengembalian', value: 'proses pengembalian'},
                {text: 'Selesai', value: 'selesai'},
            ],
        },
        {
            title: 'Dibuat Tgl',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
            // render: showStatus,
        },
        {
            title: 'Terakhir Di Ubah',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
        },
        {
            title: 'Dibuat Oleh',
            dataIndex: 'created_by',
            key: 'created_by',
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Retur) => (
                <Dropdown menu={{
                    items:[
                        {
                          key: '1',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'proses pengembalian'} label="Proses Pengembalian" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'proses pengembalian')} onCancel={() => {}} />
                          ),
                          disabled: item.status == 'proses pengembalian',
                         
                        },
                        {
                          key: '2',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'selesai'} label="Selesai" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'selesai')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'selesai',
                        },
                        {
                            key: '4',
                            label: (
                              <Button type="link" href="retur/add_retur" onClick={() => handleEdit(item)} >Edit</Button>
                            ),
                            onClick:() => handleEdit(item),
                        },
                        {
                            key: '5',
                            label: (
                                <DeleteButton label='Hapus' onComfirm={() => handleDelete([item.retur_id!])} okText='Hapus' cancelText='Batal' />
                            ),
                        },
                    ]
                }}>
                    <SettingFilled />
                </Dropdown>
              ),
        },
    ];

    const handleDelete = async (data: string[]) => {
        setLoading(true);
        try {

            
            const response = await axiosInstance.post(`/retur/del`, {data: data});

            if(response.status == 200){
                message.success('Berhasil!');
                // router.back();
                getRetur();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }
    const handleEdit = (data: Retur) => {
        setCookie('retur_id', data.retur_id);
        // router.push('retur/add_retur');
    }

    const handleUpdateStatus = async (record: Retur[], status: string) => {
       
        setLoading(true);
        try {

            const data: {
                retur_id: string,
                status: string,
            }[] = record.map((value) => ({
                "retur_id": value.retur_id,
                "status": status,
            }))

            console.log(data);
            
            const response = await axiosInstance.post(`/retur/status`, {data: data});

            if(response.status == 200){
                message.success('Berhasil!');
                getRetur();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onChangeStatusBulk = async (e: string) => {
        handleUpdateStatus(selectedRowKeys.map((value) => ({retur_id: value} as Retur)), e);
    }

    const onExport = async () => {
        const request = {...requestParam};
        
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/retur_search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rekap_retur_${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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

    const getRetur = async (request?: NewRequestParam) => {
        setLoading(true);
        try {
            
            const response = await axiosInstance.post('/retur_search', request ?? requestParam);

            if(response.status == 200){
                setRetur(response.data.data.data);
                setSummery(response.data.data.summery);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearch = (query: string) => {
        const request = requestParam;
        request.keyword = query;
        setRequestParam(requestParam);
        getRetur(request);
    }

    const handelShowRecord = (query: string) => {
        const request = {...requestParam};
        request.limit = parseInt(query);
        setRequestParam(request);
        getRetur(request);
    }

    const rowSelection: TableRowSelection<Retur> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const onChangePagination = (page: number) => {
        const request = {...requestParam};
        request.page = page;
        setRequestParam(request);
        getRetur(request);
    }

    const onChange: TableProps<Retur>['onChange'] = (pagination, filters, sorter, extra) => {
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

        var filterColumn = {};
        for(let column in filters){
            if(filters[column] != null){
                filterColumn = {...filterColumn, ...{
                    [column]: ['in', filters[column]],
                }};
            }
            
        }

        request.where = {...filterColumn, ...{
            created_at: ['between', [currentStartDate, currentEndDate]]
        }},

        setRequestParam(request);
        getRetur(request)
    };

    const onChangeRangePicker = (dates: [string, string]) => {
        
        if(dates[0] == '' && dates[1] == ''){
            const request = {...requestParam};
            request.where['created_at'] = ['between', [currentStartDate, currentEndDate]];
            setRequestParam(request);
            getRetur(request);
        }else{
            const request = {...requestParam};
            request.where['created_at'] = ['between', dates];
            setCurrentEndDate(dates[1]);
            setCurrentStartDate(dates[0]);
            setRequestParam(request);
            getRetur(request);
        }
    }

    useEffect(() => {
        const request = {...requestParam};
        request.where = {...request.where, ...{
            created_at: ['between', [currentStartDate, currentEndDate]]
        }}
        setRequestParam(request);
        getRetur(request);
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
                    <Button icon={<PlusOutlined/>} type="primary" href="retur/add_retur" onClick={() => {
                        deleteCookie('sale_id');
                        deleteCookie('retur_id');
                    }} className="my-3 bg-blue-600 text-white" >Tambah</Button>
                    <Button icon={<ReloadOutlined/>} type="default" onClick={() => getRetur(requestParam)} className="my-3" >Reload</Button>
                    {selectedRowKeys.length > 0 && <Space className="flex items-center"><Popconfirm
                        title="Yakin Ingin Menghapus Data Retur?"
                        description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
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
                            { value: 'proses pengembalian', label: 'Proses Pengambalian' },
                            { value: 'selesai', label: 'Selesai' },
                        ]}
                        allowClear
                    >
                            </Select>
                    </Space>
                    
                    }
                </Space>
            <Row gutter={16} >
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Retur" value={formatRupiah(summery.total_amount)} loading={loading} /></Card>
                </Col>
               
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Barang Retur" value={summery.total_item} loading={loading} /></Card>
                </Col>
            </Row>
            <Space className="flex gap-3 items-center my-4">
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
                    <Input placeholder="Cari Data Retur" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table columns={columns} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} loading={loading} scroll={{ x: 'max-content'}} rowSelection={rowSelection} dataSource={returs?.data ?? []} pagination={false} rowKey={(record) => record.retur_id} />
            <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={returs?.current_page} total={returs?.total} />
            </div>
        </DashboardLayout>
    )
}

export default ReturPage;