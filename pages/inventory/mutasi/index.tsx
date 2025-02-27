import { Key, useEffect, useState } from "react";
import DashboardLayout from "../../component/DashboardLayout";
import { Pagination } from "@/type/pagination";
import { InventoryMovement } from "@/type/inventory_movement";
import { Button, Image, Input, Select, Space, Table, TableProps, Typography, message, Pagination as AntPagination } from "antd";
import {
    EyeFilled,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import Title from "antd/es/typography/Title";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/date_utils";
import { Mutation } from "@/type/mutation";
import { Item } from "@/type/item";
import { getSKU } from "@/utils/get_filters";
import Link from "next/link";
import DeleteButton from "@/pages/component/DeleteButton";
import ViewButton from "@/pages/component/ViewButton";

type OnChange = NonNullable<TableProps<Mutation>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;


const MutasiBarang: React.FC = () => {

    const [outs, setData] = useState<Pagination<Mutation>>({
        current_page: 0,
        data: [],
        last_page: 1,
        total: 0,
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [locations, setLocation] = useState<Location[]>();
    const [sku, setSku] = useState<Item[]>();
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'mutations',
        limit: 10,
        page: 1,
        request_column: [],
        request_column_relation: [],
        orderBy: {
            created_at: 'Desc',
        }
    });

    const router = useRouter();

    const column = [
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
            render: (_: any, record: Mutation, index: number) => <Typography.Link href={'/inventory/mutasi/${record.id}'}>{record.product_name ?? ''}</Typography.Link>
        },
        {
            title: 'SKU',
            dataIndex: '',
            key: 'sku',
            render: (_: any, record: Mutation, index: number) => <p>
                <Typography.Link href={'/'}>{record.sku ?? ''}</Typography.Link>
            </p>,
            onFilter: (value: boolean | Key) => {
                return true;
            },
            filters: sku?.map((value: Item) => ({
                text: value.sku,
                value: value.sku!,
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
            title: 'Tanggal',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_: any, record: Mutation, index: number) => <p>{formatDate(record.created_at)}</p>,
            sorter: true,
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

        request.where = [filterColumn],

        fetch(request);

    };
    
    const fetch = async (request?: RequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search', request ?? requestParam);
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
                fetch();
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
        request.search = {
            value: query,
            column: [
                'product_name',

            ],
        };
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
        fetch();
        fetchSKU();
    }, [])


    return (
        <DashboardLayout>
            <Title level={2}>Daftar Mutasi</Title>
            <Space className="flex justify-between">
                <Space className="gap-2">
                    <Button icon={<ReloadOutlined/>} type="default" onClick={() => fetch()} className="my-3" >Reload</Button>
                    <Button icon={<PlusOutlined/>} href="mutasi/add" type="primary" className="my-3" >Buat Mutasi</Button>
                </Space>
                <Space className="gap-3">
                        
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
            </Space>
            <Table columns={column} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} dataSource={outs!.data} pagination={false} rowKey={(record) => record.mutation_id} loading={loading} />
                <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={outs?.current_page} total={outs?.total} />
            </div>
        </DashboardLayout>
    );
}

export default MutasiBarang;