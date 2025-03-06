import { Key, useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Card, Col, DatePicker, Image, Input, Pagination as PaginationTable, Popconfirm, Row, Select, Space, Statistic, Table, TableColumnsType, TableProps, Tag, TimeRangePickerProps, Typography, message } from "antd";
import {
    FileExcelFilled,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { NewRequestParam, RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import Title from "antd/es/typography/Title";
import { useRouter } from "next/router";
import { formatDate, getStartAndEndOfMonth } from "@/utils/date_utils";
import EditButton from "@/pages/component/EditButton";
import ViewButton from "@/pages/component/ViewButton";
import DeleteButton from "@/pages/component/DeleteButton";
import { deleteCookie, setCookie } from "cookies-next";
import { TableRowSelection } from "antd/es/table/interface";
import { formatRupiah } from "@/utils/format_rupiah";
import { getLocation } from "@/utils/get_filters";
import { Location } from "@/type/location";
import dayjs from "dayjs";

type OnChange = NonNullable<TableProps<InventoryMovement>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;

const BarangKeluar: React.FC = () => {
    const router = useRouter();
    const [outs, setData] = useState<Pagination<InventoryMovement>>({
        current_page: 0,
        data: [],
        last_page: 1,
        total: 0,
    });
    const [summary, setSummary] = useState<{total_item: number, total_asset: number}>({total_asset: 0, total_item: 0});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [requestParam, setParamRequst] = useState<NewRequestParam>({
        table: '',
        limit: 10,
        page: 1,
        where: {
            type: ["in", ["out", "mutation"]]
        },
        orderBy: {
            created_at: 'desc',
        },
        type: 'search',
        request_column: [],
    });

    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const showStatus = (_: any, record: InventoryMovement, index: number) => {
        if(record.status == 'completed'){
            return <Tag color="success">SELESAI</Tag>;
        }else if(record.status == 'pending'){
            return <Tag color="processing">PENDING</Tag>;
        }else if(record.status == 'reject'){
            return <Tag color="red">REJECT</Tag>;
        }

      
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const column:TableColumnsType<InventoryMovement> = [
        {
            title: 'No',
            dataIndex: '',
            key: 'no',
            render: (_: any, record: any, index: number) => <p>{(outs.current_page - 1) * 10 + index + 1}</p>,
        },
        {
            title: 'Product',
            dataIndex: '',
            key: 'product_name',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.product_name}</p>,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Barcode',
            dataIndex: 'barcode',
            key: 'barcode',
        },
        {
            title: 'Sumber',
            dataIndex: 'reference',
            key: 'reference',
            render: (_: any, record: InventoryMovement, index: number) => checkSource(record),
            onFilter: (value: boolean | Key, record: InventoryMovement) => {
                
                return true;
            },
            filters: [
                {
                    text: 'Mutasi',
                    value: 'inventory',
                },
                {
                    text: 'Penjualan',
                    value: 'sales',
                },
                {
                    text: 'Penukaran Barang',
                    value: 'exchange',
                }
            ],
            filterSearch: true,
        },
        {
            title: 'Quantity',
            dataIndex: '',
            key: 'quantity',
            sorter: true,
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity} {record.unit_name}</p>
        },
        {
            title: 'Gudang',
            dataIndex: '',
            key: 'location_from',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.location_from ?? ''}</p>,
            onFilter: (value: boolean | Key, record: InventoryMovement) => {
                
                return true;
            },
            filters: locations?.map((value: Location) => ({
                text: value.name,
                value: value.name,
            })),
            filterSearch: true,
        },
        {
            title: 'Status',
            dataIndex: '',
            key: 'status',
            render: showStatus,
            onFilter: (value: boolean | Key, record: InventoryMovement) => {
                
                return true;
            },
            filters: [
                {
                    text: 'Pending',
                    value: 'pending',
                },
                {
                    text: 'Selesai',
                    value: 'completed',
                },
                {
                    text: 'Reject',
                    value: 'reject',
                },
            ],
            filterSearch: true,
        },
        {
            title: 'Tanggal',
            dataIndex: '',
            key: 'created_at',
            sorter: true,
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatDate(record.created_at)}</p>
        },
        {
            title: 'Update',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatDate(record.updated_at)}</p>
        },
        {
            title: 'Dibuat oleh',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.created_by}</p>
        },
       
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: InventoryMovement) => (
                <>
                    <EditButton label='' href="in/add" onClick={() => setCookie('movement_id', [record.id])}/>
                    <ViewButton label=''  href={`/inventory/out/${record.id}`} />
                    <DeleteButton label='' onComfirm={() => handleDelete([record.id])} okText='Hapus' cancelText='Batal' />
                </>
            ),
        },
    ]

    const onChange: TableProps<InventoryMovement>['onChange'] = (pagination, filters, sorter, extra) => {
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
            created_at: ['between', [currentStartDate, currentEndDate]]
        }},

        setParamRequst(request);
        fetch(request)
    };

    const checkSource = (source: InventoryMovement) => {
        
        switch (source.reference) {
            case 'inventory':
                return <p>Mutasi</p>
            case 'retur':
                return <p>Retur</p>
            case 'exchange':
                return <p>Penukaran barang</p>
            case 'sales':
                return <p>Penjualan</p>
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

    const fetch = async (request: NewRequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/movement_search', request);
            if(response.status == 200){
                // console.log(response.data.data.data);

                setData(response.data.data.data);
                setSummary(response.data.data.summary);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const getLocationUtils = async () => {
        getLocation().then((response) => {
            
            setLocations(response as unknown as Location[]);
        })
        
    }

    const paginateClick = (value: number) => {
        const request = {...requestParam};
        request.page = value;
        fetch(request);
    }

    const handelShowRecord = (query: string) => {
        const request = {...requestParam};
        request.limit = parseInt(query);
        setParamRequst(request);
        fetch(request);
    }

    const onSearch = (query: string) => {
        const request = {...requestParam};
        request.keyword = query;
        setParamRequst(request);
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

    const onExport = async () => {
        const request = {...requestParam};
        // request.column = exportColumns;
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/movement_search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;

            const date = new Date;

            link.setAttribute('download', `daftar_barang_keluar_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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
        setParamRequst(request);
        fetch(request);
    }

    useEffect(() => {
        getLocationUtils();
        const request = {...requestParam};
        request.where = {...request.where, ...{
            created_at: ['between', [currentStartDate, currentEndDate]]
        }}
        setParamRequst(request);
        fetch(request);
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Barang Keluar</Title>
            <Space className="gap-3">
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch(requestParam)} >Reload</Button>
                <Button icon={<PlusOutlined/>} type="primary" href="/inventory/in/add" onClick={() => deleteCookie('movement_id')} >Tambah</Button>
                {/* <Button icon={<FileExcelFilled/>} color="green" variant="solid" onClick={onExport} className="my-3" >Export Ke Excel</Button> */}
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
            <Row gutter={16} className="my-8" >
                <Col span={12} className="">
                    <Card><Statistic title="Total Harga Beli" value={formatRupiah(summary.total_asset)} loading={loading} /></Card>
                </Col>
               
                <Col span={12} className="">
                    <Card><Statistic title="Total Barang keluar" value={summary.total_item} loading={loading} /></Card>
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
                <Button icon={<FileExcelFilled/>} variant="solid" onClick={onExport} >Export Ke Excel</Button>
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
                <Input placeholder="Cari Inventory" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table<InventoryMovement> onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} columns={column} scroll={{ x: 'max-content'}}  dataSource={outs!.data} rowSelection={rowSelection} pagination={false} rowKey={(record) => record.id} loading={loading} />
            <div className="flex justify-end my-4">
            <PaginationTable onChange={paginateClick} defaultCurrent={outs.current_page} defaultPageSize={requestParam.limit} total={outs.total} />
            </div>
        </DashboardLayout>
    );
}

export default BarangKeluar;