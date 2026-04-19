import { InventoryMovement, InventoryMovementStatus, InventoryMovementStatusView } from "@/type/inventory_movement";
import { Pagination } from "@/type/pagination";
import { NewRequestParam } from "@/type/request_param";
import { formatDate, getStartAndEndOfMonth } from "@/utils/date_utils";
import { message, Table, TableColumnsType, Pagination as PaginationTable, Tag, Space, Button, DatePicker, TimeRangePickerProps, Input, TableProps } from "antd";
import { Key, useEffect, useState } from "react";
import { Location } from "@/type/location";
import { ItemUnit } from "@/type/item";
import { getLocation } from "@/utils/get_filters";
import axiosInstance from "@/utils/axiosInstance";
import { TableRowSelection } from "antd/es/table/interface";
import Title from "antd/es/typography/Title";
import {
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import dayjs from "dayjs";


const { RangePicker } = DatePicker;
type MovementItemContentProps = {
  type?: string[];
};

type OnChange = NonNullable<TableProps<InventoryMovement>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const MovementItemContent: React.FC<MovementItemContentProps> = ({type}) => {

    const [data, setData] = useState<Pagination<InventoryMovement>>({
            current_page: 0,
            data: [],
            last_page: 1,
            per_page: 10,
            total: 0,
        });

        const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
        const [loading, setLoading] = useState<boolean>(false);
        const [locations, setLocations] = useState<Location[]>([]);
        const [units, setUnits] = useState<ItemUnit[]>();
        const [requestParam, setParamRequst] = useState<NewRequestParam>({
            table: '',
            limit: 10,
            page: 1,
            where: {
                type: ["in", type]
            },
            orderBy: {
                created_at: 'desc',
            },
            type: 'search',
            request_column: [],
        });

        const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
            const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const showReference = (_: any, record: InventoryMovement, index: number) => {
        if(record.reference == 'inventory'){
            return <Tag key={record.id} color="processing">INVENTORY</Tag>;
        }else if(record.reference == 'sales'){
            return <Tag key={record.id} color="success">PENJUALAN</Tag>;
        }else if(record.reference == 'exchange'){
            return <Tag key={record.id} color="warning">PENUKARAN</Tag>;
        }else if(record.reference == 'retur'){
            return <Tag key={record.id} color="error">RETUR</Tag>;
        }else{
            return <Tag key={record.id} color="default">N/A</Tag>;
        }
        
    }
    const showStatus = (_: any, record: InventoryMovement, index: number) => {
        if(record.status == InventoryMovementStatus.COMPLETED){
            return <Tag key={record.id} color="success">{InventoryMovementStatusView.COMPLETED}</Tag>;
        }else if(record.status == InventoryMovementStatus.CANCELLED){
            return <Tag key={record.id} color="default">{InventoryMovementStatusView.CANCELLED}</Tag>;
        }else if(record.status == InventoryMovementStatus.REJECTED){
            return <Tag key={record.id} color="error">{InventoryMovementStatusView.REJECTED}</Tag>;
        }else if(record.status == InventoryMovementStatus.DELIVER_TO_BUYER){
            return <Tag key={record.id} color="warning">{InventoryMovementStatusView.COMPLETED}</Tag>;
        }if(record.status == InventoryMovementStatus.DELIVER_TO_SELLER){
            return <Tag key={record.id} color="process">{InventoryMovementStatusView.COMPLETED}</Tag>;
        }else{
            return <Tag key={record.id} color="default">N/A</Tag>;
        }
        
    }


    const column:TableColumnsType<InventoryMovement> = [
            {
                title: 'No',
                dataIndex: '',
                key: 'no',
                render: (_: any, record: any, index: number) => <p>{(data.current_page - 1) * 10 + index + 1}</p>,
            },
            {
                title: 'Type',
                dataIndex: 'reference',
                key: 'reference',
                render: showReference,
                sorter: true,
            },
            {
                title: 'Nama Item',
                dataIndex: 'product_name',
                key: 'product_name',
                render: (_: any, record: InventoryMovement, index: number) => <p>{record.product_name ?? ''}</p>,
                sorter: true,
            
            },
            {
                title: 'SKU',
                dataIndex: 'sku',
                key: 'sku',
                sorter: true,
                render: (_: any, record: InventoryMovement, index: number) => <p>{record.sku || 'N/A'}</p>
            },
            {
                title: 'QTY',
                dataIndex: 'quantity',
                key: 'quantity',
                sorter: true,
                render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity}</p>
            },
            {
                title: 'Satuan',
                dataIndex: 'unit_name',
                key: 'unit_name',
                sorter: true,
                render: (_: any, record: InventoryMovement, index: number) => <p>{record.unit_name}</p>,
                onFilter: (value: boolean | Key, record: InventoryMovement) => {
                                
                    return true;
                },
                filters: units?.map((value: ItemUnit) => ({
                    text: value.name,
                    value: value.name,
                })),
                filterSearch: true,
            },
            {
                title: 'Gudang',
                dataIndex: 'location_to',
                key: 'location_to',
                sorter: true,
                render: (_: any, record: InventoryMovement, index: number) => <p>{record.location_to}</p>,
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
                dataIndex: 'status',
                key: 'status',
                render: showStatus,
                onFilter: (value: boolean | Key, record: InventoryMovement) => {
                    
                    return true;
                },
                filters: [
                    {
                        text: InventoryMovementStatusView.COMPLETED,
                        value: InventoryMovementStatus.COMPLETED,
                    },
                    {
                        text: InventoryMovementStatusView.CANCELLED,
                        value: InventoryMovementStatus.CANCELLED,
                    },
                    {
                        text: InventoryMovementStatusView.REJECTED,
                        value: InventoryMovementStatus.REJECTED,
                    },
                    {
                        text: InventoryMovementStatusView.DELIVER_TO_SELLER,
                        value: InventoryMovementStatus.DELIVER_TO_SELLER,
                    },
                ],
                filterSearch: true,
            },
            {
                title: 'Tanggal Dibuat',
                dataIndex: 'created_at',
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
    ];

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

        request.where = filterColumn,

        setParamRequst(request);

    };


    

        const getLocationUtils = async () => {
                getLocation().then((response) => {
                    
                    setLocations(response as unknown as Location[]);
                })
                
            }

            const fetchData = async (request: NewRequestParam) => {
                    setLoading(true);
                    try {
                        const response = await axiosInstance.post('/movement_search', request);
                        if(response.status == 200){
                            // console.log(response.data.data.data);
            
                            setData(response.data.data.data);
                            // setSummary(response.data.data.summary);
                        }
                    } catch (error: any) {
                        message.error(`${error.response?.data?.message}`);
                    } finally {
                        setLoading(false);
                    }
                }


        const paginationClick = (page: number, pageSize: number) => {
            const request = {...requestParam};
            request.limit = pageSize;
            request.page = page;
            setParamRequst(request);
            // fetchItems(request);
        }

        const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
            console.log('selectedRowKeys changed: ', newSelectedRowKeys);
            setSelectedRowKeys(newSelectedRowKeys);
        };
        
        const rowSelection: TableRowSelection<InventoryMovement> = {
            selectedRowKeys,
            onChange: onSelectChange,
        };

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
           
        }

        const onSearch = (query: string) => {
            const request = {...requestParam};
            request.keyword = query;
            setParamRequst(request);
        }


        useEffect(() => {
                getLocationUtils();
                
                const request = {...requestParam};
                request.where = {...request.where, ...{
                    created_at: ['between', [currentStartDate, currentEndDate]]
                }}
                setParamRequst(request);
                
            }, []);

        useEffect(() => {
            fetchData(requestParam);
        }, [requestParam]);

        return (
            <div>
                <Title level={2}>Daftar Barang Masuk</Title>
          
          
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
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetchData(requestParam)} >Reload</Button>
                <Input placeholder="Cari Data Barang Keluar" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
            </Space>
                <Table<InventoryMovement> 
                    showSorterTooltip={{ target: 'sorter-icon' }} onChange={onChange} columns={column} scroll={{ x: 'max-content'}}  dataSource={data!.data} rowSelection={rowSelection} pagination={false} rowKey={(record) => record.id} loading={loading} />
                <div className="flex justify-end my-4">
                <PaginationTable onChange={paginationClick} showSizeChanger defaultCurrent={data.current_page} defaultPageSize={requestParam.limit} total={data.total} />
                </div>
            </div>
        )
}


export default MovementItemContent;