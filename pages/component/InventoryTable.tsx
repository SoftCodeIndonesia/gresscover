
import { Key, useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Pagination as AntPagination, Space, Tag, TableProps, Popconfirm, TableColumnsType } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";

import DashboardLayout from "../component/DashboardLayout";

import {
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { FormLayout } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { formatRupiah } from "@/utils/format_rupiah";
import { Item } from "@/type/item";
import EditButton from "../component/EditButton";
import DeleteButton from "../component/DeleteButton";
import { useRouter } from "next/router";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import { deleteCookie, setCookie } from "cookies-next";
import { Location } from "@/type/location";
import ViewButton from "../component/ViewButton";

type SearchInventory = {
    order_by: any,
    where?: any,
    limit: number,
    page: number,
}

type SearchInventoryResult = {
    harga_beli: number,
    harga_jual: number,
    location_name: string,
    sku_induk: string,
    quantity: number,
    product_name: string,
    inventory_id: string,
    quantity_unit: number,
    unit_name: string,
}

type OnChange = NonNullable<TableProps<SearchInventoryResult>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;


const { Content } = Layout;
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
const InventoryTable: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout] = useState<FormLayout>('vertical');
    const [inventories, setInventories] = useState<Pagination<SearchInventoryResult>>();
    const [locations, setLocation] = useState<Location[]>();
    const [sku, setSku] = useState<string[]>();
    const [request_param, setRequestParam] = useState<SearchInventory>({
        order_by: {
            updated_at: 'desc',
        },
        limit: 10,
        page: 1,
    });

    const [form] = Form.useForm();

    const router = useRouter();

    const columns: TableColumnsType<SearchInventoryResult> = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Inventory',
            dataIndex:'item.name', 
            key: 'item.name',
            render: (_:any, record: SearchInventoryResult) => <p>{record.product_name}</p>,
        },
        {
            title: 'SKU Induk',
            dataIndex:'parent.sku', 
            key: 'parent.sku',
            render: (_:any, record: SearchInventoryResult) => <p>{record.sku_induk}</p>,
            onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
                
                return true;
            },
            filters: sku?.map((value: string) => ({
                text: value,
                value: value,
            })),
        },
        {
            title: 'Gudang',
            dataIndex:'i.location_id', 
            key: 'i.location_id',
            render: (_:any, record: SearchInventoryResult) => <p>{record.location_name}</p>,
            onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
                
                return true;
            },
            filters: locations?.map((value: Location) => ({
                text: value.name,
                value: value.location_id,
            })),
            // onFilter: (value) => {
            //     return console.log(value);
            // },
        },
        {
            title: 'Harga Jual',
            dataIndex:'', 
            key: '',
            render: (_:any, record: SearchInventoryResult) => <p>{formatRupiah(record.harga_jual)}</p>,
        },
        {
            title: 'Stok',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_:any, record: SearchInventoryResult) => record.quantity == 0 ? <Tag color="#f50">Habis</Tag> : record.quantity_unit + ' ' + record.unit_name,
            sorter: true,
        },
        // {
        //     title: 'Aksi',
        //     key: 'action',
        //     render: (_: any, item: SearchInventoryResult) => (
        //         <>
                  
        //           <ViewButton label=''  onClick={() => router.push('inventory/' + item.inventory_id)}/>
        //           <DeleteButton label='' onComfirm={() => handleDelete([item.inventory_id])} okText='Hapus' cancelText='Batal' />
        //         </>
        //       ),
        // },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<SearchInventoryResult> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    
    
    const handleEdit = (ids: String[]) => {
        const inventory_id = setCookie('movement_id', ids);
        router.push('/inventory/add');
    }

    const handleNewInventory = () => {
        deleteCookie('movement_id')
        router.push('/inventory/add');
    }

    const handleDelete = async (ids: String[]) => {

        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/search_del`, {"table": 'inventory', "data": ids});
            if(response.status == 200){
                message.success('Item Telah Dihapus!');
                getInventories();
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

    const onChangePagination = (page: number) => {
        const request = {...request_param};
        request.page = page;
        setRequestParam(request);
        getInventories(request);
    }

    const getInventories = async (request?: SearchInventory) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/inventory/search', request ?? request_param);

            if(response.status == 200){
                setInventories(response.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getSkuInduk = () => {
        try {
             const param = {
                table: 'product',
                page: 1,
                limit: 10,
                request_column:['sku'],
                request_column_relation: [],
                where: [
                    {
                        parent_id: null,
                    }
                ]
            }

            axiosInstance.post('/search', param).then((response) => {
                if(response.status == 200){
                    const items: Pagination<Item> = response.data.data;
                    setSku(items.data.map((value) => (value.sku)));
                }
            })
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        }
    }
    const getLocation = () => {
        try {
             const param = {
                table: 'location',
                page: 1,
                limit: 10,
                request_column:['location_id','name'],
                request_column_relation: []
            }

            axiosInstance.post('/search', param).then((response) => {
                if(response.status == 200){
                    const locations: Pagination<Location> = response.data.data;
                    setLocation(locations.data);
                }
            })
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        }
    }

    const onChange: TableProps<SearchInventoryResult>['onChange'] = (pagination, filters, sorter, extra) => {
        // console.log('params', pagination, filters, sorter, extra);
        // console.log(sorter);

        const sort: Sorts = sorter as Sorts;
        
        const request = {...request_param};
        if(sort.columnKey != undefined){
            request.order_by = {
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

        

        getInventories(request);
    };
      


    useEffect(() => {
        getInventories();
        getLocation();
        getSkuInduk();
    }, []);
    

    return (
        <>
            <Table<SearchInventoryResult> columns={columns} onChange={onChange}
    showSorterTooltip={{ target: 'sorter-icon' }} pagination={false} loading={loading} rowSelection={rowSelection} dataSource={inventories?.data} rowKey={(record) => record.inventory_id} />
            <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={inventories?.current_page} total={inventories?.total} />
            </div>
        </>
    );
};


export default InventoryTable;
