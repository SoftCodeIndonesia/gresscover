import { Key, useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
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
import { Movement } from "@/type/movement";

type OnChange = NonNullable<TableProps<Movement>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;

const MovementIn: React.FC = () => {
    const router = useRouter();
    const [outs, setData] = useState<Pagination<Movement>>({
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
            type: ["in", ["in"]]
        },
        orderBy: {
            created_at: 'desc',
        },
        type: 'search',
        request_column: [],
    });

    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const showStatus = (_: any, record: Movement, index: number) => {
        if(record.is_payment == 'Lunas'){
            return <Tag color="success">Lunas</Tag>;
        }else if(record.is_payment == 'Belum Lunas'){
            return <Tag color="processing">Belum Lunas</Tag>;
        }
      
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const column:TableColumnsType<Movement> = [
        {
            title: 'No',
            dataIndex: '',
            key: 'no',
            render: (_: any, record: any, index: number) => <p>{(outs.current_page - 1) * 10 + index + 1}</p>,
        },
        {
            title: 'Gudang',
            dataIndex: '',
            key: 'location_name',
            render: (_: any, record: Movement, index: number) => <p>{record.location_name ?? ''}</p>,
            onFilter: (value: boolean | Key, record: Movement) => {
                
                return true;
            },
            filters: locations?.map((value: Location) => ({
                text: value.name,
                value: value.name,
            })),
            filterSearch: true,
        },
        {
            title: 'Total SKU',
            dataIndex: 'total_sku',
            key: 'total_sku',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{record.total_sku}</p>
        },
        {
            title: 'QTY',
            dataIndex: 'total_item',
            key: 'total_item',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{record.total_item}</p>
        },
        {
            title: 'Total Harga Beli',
            dataIndex: 'total_buying_price',
            key: 'total_buying_price',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{formatRupiah(record.total_buying_price)}</p>
        },
        {
            title: 'Total Harga Jual',
            dataIndex: 'total_selling_price',
            key: 'total_selling_price',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{formatRupiah(record.total_selling_price)}</p>
        },
        {
            title: 'Status Vendor',
            dataIndex: 'is_payment',
            key: 'is_payment',
            render: showStatus,
            onFilter: (value: boolean | Key, record: Movement) => {
                
                return true;
            },
            filters: [
                {
                    text: 'Lunas',
                    value: '1',
                },
                {
                    text: 'Belum Lunas',
                    value: '0',
                },
            ],
            filterSearch: true,
        },
        {
            title: 'Tanggal Pembayaran',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (_: any, record: Movement, index: number) => <p>{ record.is_payment == 'Belum Lunas' ? '-' : formatDate(record.payment_date)}</p>,
            sorter: true,
        },
        {
            title: 'Tanggal Dibuat',
            dataIndex: 'date',
            key: 'date',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{formatDate(record.created_at)}</p>
        },
        {
            title: 'Update',
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: true,
            render: (_: any, record: Movement, index: number) => <p>{formatDate(record.updated_at)}</p>
        },
        {
            title: 'Dibuat oleh',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (_: any, record: Movement, index: number) => <p>{record.created_by}</p>
        },
       
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: Movement) => (
                <>
                    <EditButton label='' href="in/add" onClick={() => {
                        setCookie('type', 'in');
                        setCookie('movement_id', record.movement_id);
                    }}/>
                    <ViewButton label=''  href={`/inventory/in/${record.movement_id}`} />
                    <DeleteButton label='' onComfirm={() => handleDelete([record.movement_id])} okText='Hapus' cancelText='Batal' />
                </>
            ),
        },
    ]

    const onChange: TableProps<Movement>['onChange'] = (pagination, filters, sorter, extra) => {
        // console.log('params', pagination, filters, sorter, extra);
        // console.log(sorter);

        const sort: Sorts = sorter as Sorts;
        
        const request = {...requestParam};
        if(sort.columnKey != undefined){
            request.orderBy = {
                [sort.columnKey.toString()]: sort.order == "ascend" ? 'ASC' : 'DESC' 
            }
        }
        var filterColumn = {type: ["in", ["in"]]};
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
            const response = await axiosInstance.post(`/movement/destroy`, {"data": ids});
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
            const response = await axiosInstance.post('/movement/search', request);
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
    const status = async (ids: string[], status: string) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/movement/status', {data: ids, status: status});
            if(response.status == 200){
                message.success(`Berhasil Mengubah Status`);
                fetch(requestParam);
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
    
    const rowSelection: TableRowSelection<Movement> = {
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

            link.setAttribute('download', `daftar_barang_masuk_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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
            <Title level={2}>Daftar Barang Masuk</Title>
            <Space className="gap-3">
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch(requestParam)} >Reload</Button>
                <Button icon={<PlusOutlined/>} type="primary" href="/inventory/in/add" onClick={() => {
                    deleteCookie('movement_id');
                    setCookie('type', 'in');
                }} >Tambah</Button>
                {/* <Button icon={<FileExcelFilled/>} color="green" variant="solid" onClick={onExport} className="my-3" >Export Ke Excel</Button> */}
                {selectedRowKeys.length > 0 && <>
                
                    <Popconfirm
                        title="Yakin Ingin Menghapus Data Barang Masuk?"
                        description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                        onConfirm={() => handleDelete(selectedRowKeys as string[])}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>Hapus</Button>
                    </Popconfirm>
                    <Select placeholder="Ubah Status" onChange={(e) => {
                        status(selectedRowKeys as string[], e);
                    }} options={[
                        {value: 1, label: "Lunas"},
                        {value: 0, label: "Belum Lunas"},
                    ]}></Select>
                </>}
            </Space>
            <Row gutter={16} className="my-8" >
                <Col span={12} >
                    <Card><Statistic title="Total Harga Beli" value={formatRupiah(summary.total_asset)} loading={loading} /></Card>
                </Col>
               
                <Col span={12} >
                    <Card><Statistic title="Total Barang Masuk" value={summary.total_item} loading={loading} /></Card>
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
                <Input placeholder="Cari Data Barang Keluar" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
            <Table<Movement> onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} columns={column} scroll={{ x: 'max-content'}}  dataSource={outs!.data} rowSelection={rowSelection} pagination={false} rowKey={(record) => record.movement_id} loading={loading} />
            <div className="flex justify-end my-4">
            <PaginationTable onChange={paginateClick} defaultCurrent={outs.current_page} defaultPageSize={requestParam.limit} total={outs.total} />
            </div>
        </DashboardLayout>
    );
}

export default MovementIn;