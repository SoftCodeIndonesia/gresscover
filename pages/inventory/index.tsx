
import { Key, useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Pagination as AntPagination, Space, Tag, TableProps, Popconfirm, TableColumnsType, Input, Row, Card, Col, Statistic, Select, Dropdown, MenuProps, Checkbox, Divider } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";

import DashboardLayout from "../component/DashboardLayout";

import {
    ReloadOutlined,
    PlusOutlined,
    UserOutlined,
    SearchOutlined,
    FileExcelFilled
} from '@ant-design/icons';
import { FormLayout } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { formatRupiah } from "@/utils/format_rupiah";
import { Item, ItemUnit } from "@/type/item";
import EditButton from "../component/EditButton";
import DeleteButton from "../component/DeleteButton";
import { useRouter } from "next/router";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import { deleteCookie, setCookie } from "cookies-next";
import { Location } from "@/type/location";
import ViewButton from "../component/ViewButton";
import { StatisticDashbaord } from "@/type/statistic";

type SearchInventory = {
    order_by: any,
    where?: any,
    column?: string[],
    limit: number,
    page: number,
    keyword?: string,
    type: string,
    headings?: string[],
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
    sku: string,
    barcode: string,
    nilai_asset: number,
    minimum: number,
}

type OnChange = NonNullable<TableProps<SearchInventoryResult>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const CheckboxGroup = Checkbox.Group;
const { Content } = Layout;
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
const InventoryPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [statisticData, setStatistic] = useState<StatisticDashbaord>();
    const [inventories, setInventories] = useState<Pagination<SearchInventoryResult>>();
    const [locations, setLocation] = useState<Location[]>();
    const [sku, setSku] = useState<string[]>();
    const [units, setUnits] = useState<ItemUnit[]>();
    const [sku_induk, setSkuInduk] = useState<string[]>();
    const [checkedListColumn, setColumns] = useState<string[]>([
        'no',
        'product_name',
        'sku',
        'quantity_unit',
        'location_name',
        'harga_jual',
        'action',
    ]);
    const [request_param, setRequestParam] = useState<SearchInventory>({
        order_by: {
            quantity: 'desc',
        }, 
        limit: 10,
        page: 1,
        type: 'search',
        
    });

    const [form] = Form.useForm();

    const router = useRouter();

    const exportColumns = [
        'No',
        'Nama',
        'Barcode',
        'SKU',
        'Gudang',
        'Harga Beli',
        'Harga Jual',
        'Stok',
        'Minum Stok', 
        'Total Asset',
    ]

    const availableColumns: TableColumnsType<SearchInventoryResult> = [
        {
            title: 'No',
            dataIndex: '',
            key: 'no',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Inventory',
            dataIndex:'product_name', 
            key: 'product_name',
            fixed: 'left',
            render: (_:any, record: SearchInventoryResult) => <p>{record.product_name}</p>,
        },
        {
            title: 'Barcode',
            dataIndex:'barcode',
            fixed: 'left', 
            key: 'barcode',  
        },
        {
            title: 'SKU',
            dataIndex:'sku', 
            key: 'sku',
            fixed: 'left',
            // onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
            //     return true;
            // },
            // filters: sku?.map((value: string) => ({
            //     text: value,
            //     value: value,
            // })),
            // filterSearch: true,
        },
        {
            title: 'SKU Induk',
            dataIndex:'parent_sku', 
            key: 'parent_sku',
            render: (_:any, record: SearchInventoryResult) => <p>{record.sku_induk}</p>,
            // onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
                
            //     return true;
            // },
            // filters: sku_induk?.map((value: string) => ({
            //     text: value,
            //     value: value,
            // })),
            // filterSearch: true,
           
        },
        {
            title: 'Gudang',
            dataIndex:'location_name', 
            key: 'location_name',
            render: (_:any, record: SearchInventoryResult) => <p>{record.location_name}</p>,
            onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
                
                return true;
            },
            filters: locations?.map((value: Location) => ({
                text: value.name,
                value: value.name,
            })),
            filterSearch: true,
        },
        {
            title: 'Harga Beli',
            dataIndex:'harga_beli', 
            key: 'harga_beli',
            render: (_:any, record: SearchInventoryResult) => <p>{formatRupiah(record.harga_beli)}</p>,
            sorter: true,
        },
        {
            title: 'Harga Jual',
            dataIndex:'harga_jual', 
            key: 'harga_jual',
            render: (_:any, record: SearchInventoryResult) => <p>{formatRupiah(record.harga_jual)}</p>,
            sorter: true,
        },
        {
            title: 'Stok',
            dataIndex: 'quantity_unit',
            key: 'quantity_unit',
            render: (_:any, record: SearchInventoryResult) => record.quantity == 0 ? <Tag color="#f50">Habis</Tag> : record.quantity_unit,
            sorter: true,
        },
        {
            title: 'Satuan',
            dataIndex: 'unit_name',
            key: 'unit_name',
            render: (_:any, record: SearchInventoryResult) => record.unit_name,
            onFilter: (value: boolean | Key, record: SearchInventoryResult) => {
                
                return true;
            },
            filters: units?.map((value: ItemUnit) => ({
                text: value.name,
                value: value.name,
            })),
            filterSearch: true,
        },
        {
            title: 'Minum Stok',
            dataIndex:'minimum', 
            key: 'minimum',
            render: (_:any, record: SearchInventoryResult) => <p>{record.minimum}</p>,
            sorter: true,
        },
        {
            title: 'Nilai Asset',
            dataIndex:'nilai_asset', 
            key: 'nilai_asset',
            render: (_:any, record: SearchInventoryResult) => <p>{formatRupiah(record.nilai_asset)}</p>,
            sorter: true,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: SearchInventoryResult) => (
                <>
                  
                  {/* <EditButton label=''  onClick={() => setCookie('id', [item.inventory_id])}/> */}
                  <ViewButton label=''  onClick={() => router.push('inventory/' + item.inventory_id)}/>
                  <DeleteButton label='' onComfirm={() => handleDelete([item.inventory_id])} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ]

    const filteredColumns = availableColumns.filter((column) =>
        checkedListColumn.includes(column.key!.toString())
    );

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

          

            const response = await axiosInstance.post('/inventory/search', request);

            if(response.status == 200){
                setLocation(response.data.data.locations);
                setSkuInduk(response.data.data.sku_induk);
                setSku(response.data.data.sku);
                setUnits(response.data.data.units);
                setInventories(response.data.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onExport = async () => {
        const request = {...request_param};
        request.column = checkedListColumn.filter((value) => value != 'no' && value != 'action');
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/inventory/search', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `daftar_barang_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
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

        setRequestParam(request);

        getInventories(request);
    };


    const onSearch = (query: string) => {
        const request = {...request_param};
        request.keyword = query;
        setRequestParam(request);
        getInventories(request);
    }
    
    const handelShowRecord = (query: string) => {
        const request = {...request_param};
        request.limit = parseInt(query);
        getInventories(request);
    }

    const getStatistic = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/summery');
            if(response.status == 200){
                setStatistic(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }
      

    const handleColumnChange = (values: string[]) => {
        setColumns(values);
    };

    useEffect(() => {
        
        // console.log(request_param.column);
        getInventories(request_param);
        // getLocation();
        // getSkuInduk();
        // getStatistic();
    }, []);
    

    return (
        <DashboardLayout>
            {/* <Row gutter={16} >
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Semua Assets" value={formatRupiah(statisticData?.total_asset ?? 0)} loading={loading} /></Card>
                </Col>
               
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Semua Barang" value={statisticData?.total_barang ?? 0} loading={loading} /></Card>
                   
                </Col>
            </Row> */}
            <Space className="flex justify-between" >
                <Space className="gap-3">
                    <Button icon={<PlusOutlined/>} type="primary" onClick={handleNewInventory} className="my-3" >Tambah</Button>
                    <Button icon={<ReloadOutlined/>} type="default" onClick={() => getInventories(request_param)} className="my-3" >Reload</Button>
                    
                    {selectedRowKeys.length > 0 && <Popconfirm
                        title="Yakin Ingin Menghapus Data Inventory?"
                        description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                        onConfirm={() => handleDelete(selectedRowKeys as String[])}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>Hapus</Button>
                    </Popconfirm>}
                </Space>
                <Space className="gap-3">
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
                    <Input placeholder="Cari Inventory" onChange={(e) => onSearch(e.target.value)} prefix={<SearchOutlined />}  />
                </Space>
                {/* {selectedRowKeys.length > 0 && <Button variant="solid" color="geekblue" onClick={() => handleEdit(selectedRowKeys as String[])} className="my-3" >Edit</Button>} */}
            </Space>
            <Select
                    className="mb-3"
                    mode="multiple"
                    placeholder="Pilih kolom yang ingin ditampilkan"
                    defaultValue={checkedListColumn}
                    onChange={handleColumnChange}
                    style={{ width: '100%' }}
                    options={availableColumns.map((value) => ({label: value.title, value: value.key}))}
                    >
            </Select>
            <Table<SearchInventoryResult> columns={filteredColumns} onChange={onChange}
                showSorterTooltip={{ target: 'sorter-icon' }} scroll={{ x: 'max-content'}} pagination={false} loading={loading} rowSelection={rowSelection} dataSource={inventories?.data} rowKey={(record) => record.inventory_id} />
            <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={inventories?.current_page} total={inventories?.total} />
            </div>

        </DashboardLayout>
    );
};


export default InventoryPage;
