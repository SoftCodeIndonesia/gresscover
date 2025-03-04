import { Key, useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Image, Input, Select, Space, Table, TableProps, Typography, message, Pagination as AntPagination, DatePicker, TimeRangePickerProps, TableColumnsType } from "antd";
import {
    EyeFilled,
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
import { Mutation } from "@/type/mutation";
import { Item } from "@/type/item";
import { getBarcode, getLocation, getSKU } from "@/utils/get_filters";
import Link from "next/link";
import DeleteButton from "@/pages/component/DeleteButton";
import ViewButton from "@/pages/component/ViewButton";
import dayjs from "dayjs";
import { Location } from "@/type/location";

type OnChange = NonNullable<TableProps<Mutation>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const { RangePicker } = DatePicker;
const MutasiBarang: React.FC = () => {

    const [outs, setData] = useState<Pagination<Mutation>>({
        current_page: 0,
        data: [],
        last_page: 1,
        total: 0,
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [locations, setLocation] = useState<Location[]>();
    const [barcodes, setBarcodes] = useState<Item[]>();
    const [sku, setSku] = useState<Item[]>();
    const [requestParam, setParamRequst] = useState<NewRequestParam>({
        table: 'mutations',
        limit: 10,
        page: 1,
        type: 'search',
        request_column: [],
        orderBy: {
            created_at: 'Desc',
        }
    });


    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const router = useRouter();

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const column: TableColumnsType<Mutation> = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Nama Produk',
            dataIndex: '',
            key: '',
            render: (_: any, record: Mutation, index: number) => <Typography.Link href={`/inventory/mutasi/${record.mutation_id}`}>{record.product_name ?? ''}</Typography.Link>
        },
        {
            title: 'SKU',
            dataIndex: '',
            key: 'sku',
            render: (_: any, record: Mutation, index: number) => <p>{record.sku ?? ''}</p>,
            onFilter: (value: boolean | Key, record: Mutation) => {
                            
                return true;
            },
            filters: sku?.map((value: Item) => ({
                text: value.sku,
                value: value.sku,
            })),
            filterSearch: true,
        },
        {
            title: 'Barcode',
            dataIndex: 'barcode',
            key: 'barcode',
            onFilter: (value: boolean | Key, record: Mutation) => {
                            
                return true;
            },
            filters: barcodes?.map((value: Item) => ({
                text: value.barcode,
                value: value.barcode,
            })),
            filterSearch: true,
        },
        
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_: any, record: Mutation, index: number) => <p>{record.quantity}</p>,
            sorter: true,
        },
        {
            title: 'Gudang Awal',
            dataIndex: 'location',
            key: 'location',
            onFilter: (value: boolean | Key, record: Mutation) => {
                            
                return true;
            },
            filters: locations?.map((value: Location) => ({
                text: value.name,
                value: value.name,
            })),
            filterSearch: true,
        },
        {
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_: any, record: Mutation, index: number) => <p>{formatDate(record.created_at)}</p>,
            sorter: true,
        },
        {
            title: 'Terakhir Diubah',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (_: any, record: Mutation, index: number) => <p>{formatDate(record.updated_at)}</p>,
            sorter: true,
        },
        {
            title: 'Dibuat Oleh',
            dataIndex: 'created_by',
            key: 'created_by',
        },
        
        {
            title: 'Operasi',
            key: 'action',
            render: (text: any, record: Mutation) => (
                <>
                
                    <ViewButton label=''  href={`/inventory/mutasi/${record.mutation_id}`} />
                    <DeleteButton label="" onComfirm={() => handleDelete([record.mutation_id])} />
                </>
            ),
        },
    ]

    const onExport = async () => {
        const request = {...requestParam};
        // request.column = exportColumns;
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/mutations/search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;

            const date = new Date;

            link.setAttribute('download', `daftar_mutasi_barang_${date.getDate()}_${date.getMonth()}_${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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


    const getLocationUtils = async () => {
        getLocation().then((response) => {
            
            setLocation(response as unknown as Location[]);
        })
        
    }
    const getListBarcode = async () => {
        getBarcode().then((response) => {
            
            setBarcodes(response as unknown as Item[]);
        })
        
    }
    const getListSKU = async () => {
        getSKU().then((response) => {
            
            setSku(response as unknown as Item[]);
        })
        
    }

    const onChangeRangePicker = (dates: [string, string]) => {
        
        if(dates[0] == '' && dates[1] == ''){
            const start = getStartAndEndOfMonth().startOfMonth;
            const end = getStartAndEndOfMonth().endOfMonth;
            setCurrentEndDate(end);
            setCurrentStartDate(start);
            const request = {...requestParam};
            
            request.where['created_at'] = ['between', [start, end]];
            setParamRequst(request);
            fetch(request);
        }else{
            const request = {...requestParam};
            request.where['created_at'] = ['between', dates];
            setCurrentEndDate(dates[1]);
            setCurrentStartDate(dates[0]);
            setParamRequst(request);
            fetch(request);
        }
    }
    
    const onChange: TableProps<Mutation>['onChange'] = (pagination, filters, sorter, extra) => {
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
        fetch(request);

    };
    
    const fetch = async (request: NewRequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/mutations/search', request);
            if(response.status == 200){
                // console.log(response.data.data.data);

                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (string: string[]) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_del', {data: string, table: 'mutations'});
            if(response.status == 200){
                fetch(requestParam);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const fetchSKU = async () => {
        const items: Item[] = await getSKU() ?? [];
        console.log(items);
        setSku(items);
    }

    const onSearch = (query: string) => {
        const request = {...requestParam};
        request.keyword = query;
        fetch(request);
        setParamRequst(request);
    }

    const onChangePagination = (page: number) => {
        const request = {...requestParam};
        request.page = page;
        setParamRequst(request);
        fetch(request);
    }

    const handelShowRecord = (query: string) => {
        const request = {...requestParam};
        request.limit = parseInt(query);
        setParamRequst(request);
        fetch(request);
    }

    useEffect(() => {
        const request = {...requestParam};
        request.where = {...request.where, ...{
            created_at: ['between', [currentStartDate, currentEndDate]]
        }}
        setParamRequst(request);
        fetch(request);
        getLocationUtils();
        getListSKU();
        getListBarcode();
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Mutasi</Title>
            <Space className="flex flex-col items-start my-6">
                <Space className="gap-2">
                    <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch(requestParam)} className="my-3" >Reload</Button>
                    <Button icon={<PlusOutlined/>} href="mutasi/add" type="primary" className="my-3" >Buat Mutasi</Button>
                </Space>
                <Space className="flex gap-3 items-center">
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
                    <Button icon={<FileExcelFilled/>} variant="solid" onClick={onExport} className="my-3" >Export Ke Excel</Button>
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
                    <Input placeholder="Cari Daftar Mutasi" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
                </Space>
            </Space>
            <Table columns={column} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} scroll={{x: 'max-content'}}  dataSource={outs!.data} pagination={false} rowKey={(record) => record.mutation_id} loading={loading} />
                <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={outs?.current_page} total={outs?.total} />
            </div>
        </DashboardLayout>
    );
}

export default MutasiBarang;