import DashboardLayout from "@/pages/component/DashboardLayout";
import { Button, Card, Pagination as AntPagination, message, Skeleton, Space, Table, Tag,DatePicker, TimeRangePickerProps, Typography, Dropdown, MenuProps, Popconfirm, Modal, TableColumnsType, TableProps, Input, Select, Row, Col, Statistic } from "antd";
import {
    ReloadOutlined,
    PlusOutlined,
    CalendarOutlined,
    SettingFilled,
    CheckOutlined,
    CloseOutlined,
    SearchOutlined,
    FileExcelFilled
} from '@ant-design/icons';
import { Sale } from "@/type/sale";
import { deleteCookie, setCookie } from "cookies-next";
import EditButton from "@/pages/component/EditButton";
import DeleteButton from "@/pages/component/DeleteButton";
import { formatRupiah } from "@/utils/format_rupiah";
import { Key, useEffect, useState } from "react";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate, getStartAndEndOfMonth } from "@/utils/date_utils";
import dayjs from "dayjs";
import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import { TableRowSelection } from "antd/es/table/interface";

type OnChange = NonNullable<TableProps<Sale>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;
const SummerySales: React.FC = () => {

    const [request_param, setRequestParam] = useState<NewRequestParam>({
        table: 'sales',
        request_column: [],
        limit: 10,
        page: 1,

    }); 
    const [loading, setLoading] = useState<boolean>(false);
    const [popupconfirm, setpopupconfirm] = useState<boolean>(false);
    const [sales, setSales] = useState<Pagination<Sale>>();
    const [totalSales, setTotalSales] = useState<string>('0');
    const [summery, setSummery] = useState<{total_item: number, total_amount: number}>({total_amount: 0, total_item: 0});
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    
    const [checkedListColumn, setColumns] = useState<string[]>([
        'no',
        'sale_date',
        'order_number',
        'platform',
        'total_amount',
        'action',
    ]);
    

    const availableColumns: TableColumnsType<Sale> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            render: (_: any, record: Sale, index: number) => index + 1,
        },
        
        {
            title: 'No Pesanan',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (_: any, record: Sale, index: number) => <Typography.Link href={`/transaction/penjualan/${record.sale_id}`}>{record.order_number}</Typography.Link>,
        },
        {
            title: 'Tanggal',
            dataIndex: 'sale_date',
            key: 'sale_date',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p><CalendarOutlined /> {formatDate(record.sale_date!)}</p>,
        },
        {
            title: 'Total QTY',
            dataIndex: 'total_quantity',
            key: 'total_quantity',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p>{record.total_quantity}</p>,
        },
        {
            title: 'Total SKU',
            dataIndex: 'total_sku',
            key: 'total_sku',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p>{record.total_sku}</p>,
        },
        {
            title: 'No Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            render: (_: any, record: Sale, index: number) => <p >{record.delivery_number}</p>,
        },
        {
            title: 'Total',
            dataIndex:'total_amount', 
            key: 'total_amount',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p >{formatRupiah(parseInt(record.total_amount ?? '0'))}</p>,
        },
        {
            title: 'Total Potongan',
            dataIndex:'total_tax', 
            key: 'total_tax',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p >{formatRupiah(record.total_tax ?? 0)}</p>,
        },
        {
            title: 'Subtotal',
            dataIndex:'total_amount_after_tax', 
            key: 'total_amount_after_tax',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p >{formatRupiah(record.total_amount_after_tax ?? 0)}</p>,
        },
        
        {
            title: 'Platform',
            dataIndex:'platform', 
            key: 'platform',
            
            onFilter: (value: boolean | Key, record: Sale) => {
                            
                return true;
            },
            filters: [
                {text: 'Shopee', value: 'shopee'},
                {text: 'Tokopedia', value: 'tokopedia'},
                {text: 'Tiktok', value: 'tiktok'},
                {text: 'Lazada', value: 'lazada'},
                {text: 'Blibli', value: 'blibli'},
                {text: 'Offline', value: 'offline'},
                {text: 'Lainya', value: 'lainya'},
            ],
            filterSearch: true,
            render: (_: any, record: Sale, index: number) => <p>{record.platform?.toUpperCase()}</p>
        },
        {
            title: 'Status Penjualan',
            dataIndex:'status', 
            key: 'status',
            align: 'center',
            render: (_: any, record: Sale, index: number) => getStatus(record.status!),
            onFilter: (value: boolean | Key, record: Sale) => {
                            
                return true;
            },
            filters: [
                {text: 'Sedang dikemas', value: 'sedang dikemas'},
                {text: 'Dalam pengiriman', value: 'dalam pengiriman'},
                {text: 'Pesanan Terkirim', value: 'pesanan terkirim'},
            ],
            filterSearch: true,
        },
        {
            title: 'Retur',
            dataIndex:'has_retur', 
            key: 'has_retur',
            align: 'center',
            render: (_: any, record: Sale, index: number) => is_retur(record.has_retur ?? 0),
            onFilter: (value: boolean | Key, record: Sale) => {
                            
                return true;
            },
            filters: [
                {text: 'Retur', value: 1},
                {text: 'Tidak Ada Retur', value: 0},
            ],
            filterSearch: false,
        },
        {
            title: 'Dibuat Oleh',
            dataIndex:'created_by', 
            key: 'created_by',
            align: 'center',
        },
        {
            title: 'QTY Retur',
            dataIndex:'quantity_retur', 
            key: 'quantity_retur',
            align: 'center',
            render: (_: any, record: Sale, index: number) => <p>{record.quantity_retur ?? 0}</p>,
        },
        // {
        //     title: 'Status Vendor',
        //     dataIndex:'status_vendor', 
        //     key: 'status_vendor',
        //     align: 'center',
        //     onFilter: (value: boolean | Key, record: Sale) => {
                            
        //         return true;
        //     },
        //     filters: [
        //         {text: 'Lunas', value: 'Lunas'},
        //         {text: 'Belum Lunas', value: 'Belum Lunas'},
        //     ],
        //     filterSearch: true,
        //     render: (_: any, record: Sale, index: number) => record.status_vendor == 'Belum Lunas' ? <Tag color="#f50">Belum Lunas</Tag> : <Tag color="#108ee9">Lunas</Tag>,
        // },
        {
            title: 'Tgl Dibuat',
            dataIndex: 'created_at',
            key: 'created_at',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p><CalendarOutlined /> {formatDate(record.created_at!)}</p>,
        },
        {
            title: 'Tgl Diubah',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
            render: (_: any, record: Sale, index: number) => <p><CalendarOutlined /> {formatDate(record.updated_at!)}</p>,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Sale) => (
                <Dropdown menu={{
                    items:[
                        {
                          key: '1',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'sedang dikemas'} label="Sedang Dikemas" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus(item, 'sedang dikemas')} onCancel={() => {}} />
                          ),
                          disabled: item.status == 'sedang dikemas',
                         
                        },
                        {
                          key: '2',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'dalam pengiriman'} label="Dalam pengiriman" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus(item, 'dalam pengiriman')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'dalam pengiriman',
                        },
                        {
                          key: '3',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'pesanan terkirim'} label="Pesanan Terkirim" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus(item, 'pesanan terkirim')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'pesanan terkirim'
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
                                <DeleteButton label='Hapus' onComfirm={() => handleDelete([item.sale_id!])} okText='Hapus' cancelText='Batal' />
                            ),
                        },
                    ]
                }}>
                    <SettingFilled />
                </Dropdown>
              ),
        },
    ];

    const filteredColumns = availableColumns.filter((column) =>
        checkedListColumn.includes(column.key!.toString())
    );

    const onChange: TableProps<Sale>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
        // console.log(sorter);

        const sort: Sorts = sorter as Sorts;
        
        const request = {...request_param};
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
            sale_date: ['between', [currentStartDate, currentEndDate]]
        }},

        setRequestParam(request);
        getSales(request)
    };


    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Sale> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    
    const handleUpdateStatus = async (record: Sale, status: string) => {
        const sale: Sale = record;
        sale.status = status;
        setLoading(true);
        try {

            const data = {
                "sale_id": sale.sale_id,
                "status": status,
            }

            console.log(data);
            
            const response = await axiosInstance.put(`/sales/status`, data);

            if(response.status == 200){
                message.success('Berhasil!');
                getSales();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateStatusBulk = async (record: string[], status: string, is_vendor: boolean) => {
       
        setLoading(true);
        try {

            const data = {
                data: record,
                status: status,
            }

            console.log(data);

            const stringUrl = is_vendor ? '/sales/vendor_status' : '/sales/status_bulk'
            
            const response = await axiosInstance.put(stringUrl, data);

            if(response.status == 200){
                message.success('Berhasil!');
                setSelectedRowKeys([]);
                getSales();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }
    
    
    const handleEdit = (data: Sale) => {
         setCookie('sale_id', data.sale_id);
         window.location.href = 'penjualan/add';
    }

    const handleDelete = async (sale: string[]) => {
        setLoading(true);
        try {

            const data = {
                "data": sale,
            }

            console.log(data);
            
            const response = await axiosInstance.post(`/sales/del`, data);

            if(response.status == 200){
                message.success('Berhasil Hapus Data!');
                getSales();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getSales = async (request?: NewRequestParam) => {
        setLoading(true);
        try {
            // const request: RequestParam = {
            //     table: 'sales',
            //     request_column: [],
            //     request_column_relation: [],
            //     limit: 10,
            //     page: 1,
        
            // };

            
            const response = await axiosInstance.post('/sales_search', request ?? request_param);

            if(response.status == 200){
                setSales(response.data.data.data);
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
        const request = {...request_param};
        
        request.where['created_at'] = ['between', range];
        setRequestParam(request);
        getSales(request);
    }

    const getStatus = (status: string) => {
        if(status == 'sedang dikemas'){
            return <Tag color="default">{status.toUpperCase()}</Tag>
        }else if(status == 'dalam pengiriman'){
            return <Tag color="blue">{status.toUpperCase()}</Tag>
        }else if(status == 'pesanan terkirim'){
            return <Tag color="green">{status.toUpperCase()}</Tag>
        }else if(status == 'retur'){
            return <Tag color="red">{status.toUpperCase()}</Tag>
        }else if(status == 'lunas'){
            return <Tag color="green">{'Selesai'}</Tag>
        }
    }
    const is_retur = (status: number) => {
        console.log(status);
        if(status == 1){
            return <Tag color="red">YA</Tag>
        }else if(status == 0){
            return <Tag color="green">TIDAK</Tag>
        }
    }

    const onSearch = (query: string) => {
        const request = request_param;
        request.keyword = query;
        setRequestParam(request_param);
        getSales(request);
    }

    const onExport = async () => {
        const request = {...request_param};
        
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/sales_search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rekap_penjualan_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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

    const handleColumnChange = (values: string[]) => {
        setColumns(values);
    };

    const handelShowRecord = (query: string) => {
        const request = {...request_param};
        request.limit = parseInt(query);
        setRequestParam(request);
        getSales(request);
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const onChangePagination = (page: number) => {
        const request = {...request_param};
        request.page = page;
        setRequestParam(request);
        getSales(request);
    }
    
    useEffect(() => {
        const request = {...request_param};
        request.where = {...request.where, ...{
            sale_date: ['between', [currentStartDate, currentEndDate]]
        }}
        setRequestParam(request);
        getSales(request);
        
        
    }, []);

    return (
        <>
            <p className="mt-6 font-bold text-lg">Laporan Penjualan</p>
            
            <Row gutter={16} className="mt-6" >
                <Col span={12} className="">
                    <Card><Statistic title="Total Penjualan" value={formatRupiah(summery.total_amount)} loading={loading} /></Card>
                </Col>
               
                <Col span={12} className="">
                    <Card><Statistic title="Total Barang Terjual" value={summery.total_item} loading={loading} /></Card>
                </Col>
            </Row>
            <Space className="gap-3 w-full mt-6">
                    <Button icon={<PlusOutlined/>} type="primary" href="penjualan/add" onClick={() => deleteCookie('sale_id')} >Tambah</Button>
                    <Button icon={<ReloadOutlined/>} type="default" onClick={() => getSales(request_param)} >Reload</Button>
                    {selectedRowKeys.length > 0 && <>
                        
                        <Popconfirm
                            title="Yakin Ingin Menghapus Data Inventory?"
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
                            onChange={(e) => {
                                handleUpdateStatusBulk(selectedRowKeys as string[], e, false);
                            }}
                            options={[
                                { value: 'sedang dikemas', label: 'Sedang Dikemas' },
                                { value: 'dalam pengiriman', label: 'Dalam Pengiriman' },
                                { value: 'pesanan terkirim', label: 'Pesanan Terkirim' },
                            ]}
                            style={{width: 200}}
                            allowClear
                        >
                        </Select>
                    </>
                    
                    }
                    
            </Space>
            <Space className="gap-3 mt-6">
                <p>Filter : </p>
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
                    <Input placeholder="Cari Daftar Penjualan" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table className="mt-6" columns={availableColumns} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} scroll={{ x: 'max-content'}} rowSelection={rowSelection} dataSource={sales?.data} rowKey={(record) => record.sale_id!} pagination={false} />
            <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={sales?.current_page} total={sales?.total} />
            </div>
        </>
    );
}

export default SummerySales;

