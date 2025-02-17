
import { useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Pagination as AntPagination, Space, Tag, TableProps, Popconfirm } from "antd";
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
import ViewButton from "../component/ViewButton";



const { Content } = Layout;
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
const InventoryPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout] = useState<FormLayout>('vertical');
    const [inventories, setInventories] = useState<Pagination<Inventory>>();
    const [request_param, setRequestParam] = useState<RequestParam>({
        table: 'inventory',
        page: 1,
        limit: 10,
        request_column:['product_name','inventory_id', 'quantity', 'location_id', 'unit_id', 'unit_name', 'price'],
        request_column_relation: ['location']
    });

    const [form] = Form.useForm();

    const router = useRouter();

    const columns = [
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
            render: (_:any, record: Inventory) => <p>{record.product_name}</p>,
        },
        {
            title: 'Gudang',
            dataIndex:'location.name', 
            key: 'location.name',
            render: (_:any, record: Inventory) => <p>{record.location?.name}</p>,
        },
        {
            title: 'Harga Jual',
            dataIndex:'', 
            key: '',
            render: (_:any, record: Inventory) => <p>{formatRupiah(record.price)}</p>,
        },
        {
            title: 'Stok',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (_:any, record: Inventory) => record.quantity == 0 ? <Tag color="#f50">Habis</Tag> : record.quantity + ' ' + record.unit_name
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Inventory) => (
                <>
                  
                  <ViewButton label=''  onClick={() => router.push('inventory/' + item.inventory_id)}/>
                  <DeleteButton label='' onComfirm={() => handleDelete([item.inventory_id])} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Inventory> = {
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

    const getInventories = async (request?: RequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search', request ?? request_param);

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


    useEffect(() => {
        getInventories();
    }, []);
    

    return (
        <DashboardLayout>
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
                {selectedRowKeys.length > 0 && <Button variant="solid" color="geekblue" onClick={() => handleEdit(selectedRowKeys as String[])} className="my-3" >Edit</Button>}
            </Space>

            <Table columns={columns} pagination={false} loading={loading} rowSelection={rowSelection} dataSource={inventories?.data} rowKey={(record) => record.inventory_id} />
            <div className="flex my-3 justify-end">
                <AntPagination onChange={onChangePagination} defaultCurrent={inventories?.current_page} total={inventories?.total} />
            </div>

        </DashboardLayout>
    );
};


export default InventoryPage;
