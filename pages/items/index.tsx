import { Item } from "@/type/item"
import { formatRupiah } from "@/utils/format_rupiah";
import { Image, Button, Input, message, Space, Table, Typography, Popconfirm, TableProps } from "antd";
import { useEffect, useState } from "react"
import DashboardLayout from "../component/DashboardLayout";
import Title from "antd/es/typography/Title";
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import axiosInstance from "@/utils/axiosInstance";
import { setCookie } from "cookies-next";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import Link from "next/link";
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
const Items = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [items, setItems] = useState<Pagination<Item>>();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState('');
    const [requestParam, setParamRequst] = useState<{limit: number, page: number}>({
        limit: 10,
        page: 1,
    });

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const handleEdit = (id: string) => {
        setCookie('item_id', id);
        window.location.href = '/items/add';
    }
    const newItem = () => {
        setCookie('item_id', null);
        window.location.href = '/items/add';
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Item> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Photo',
            dataIndex:'photo', 
            key: 'photo',
            render: (_: any, record: Item) => record.photo != null ? <Image
                width={40}
                src={`${process.env.NEXT_PUBLIC_BE}/storage/${record.photo}`}
                fallback="data:image/png;base64,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"
            /> : '',
        },
        {
            title: 'Nama item',
            dataIndex:'name', 
            key: 'name',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Semua Stok',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (_:any, record: Item) => <p>{`${record.overall_quantity} pieces`}</p>,
        },
        
        {
            title: 'Harga Beli',
            dataIndex: 'cost',
            key: 'cost',
            render: (_:any, record: Item) => formatRupiah(parseFloat(record.cost)),
        },
        {
            title: 'Kategori',
            dataIndex: ['category', 'name'],
            key: 'category',
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (text: any, record: Item) => (
                <div className='flex gap-3 items-center'>
                    <Link passHref href={`items/${record.product_id}`}>
                        Detail
                    </Link>
                    <Button type='link' className="text-yellow-500" onClick={() => handleEdit(record.product_id)}>Edit</Button>
                    <Popconfirm title="Hapus Item" cancelText="Batal" onConfirm={() => handleDelete([record.product_id!])} okText="Hapus" description={`Anda Yakin Ingin Menghapus Item Ini?`}>

                        <Button type='link' danger>Delete</Button>

                    </Popconfirm>
                </div>
            ),
        },
    ];
    

    const handleDelete = async (ids: String[]) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/search_del`, {"table": 'product', "data": ids});
            if(response.status == 200){
                message.success('Item Telah Dihapus!');
                fetchItems();
            }else{
                setSelectedRowKeys([]);
                message.error('Gagal Telah Dihapus!');
            }
        } catch (error) {
            message.error('Gagal Hapus Item!');
        } finally {
            setLoading(false);
        }
    }

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/items_search', requestParam);
            if(response.status == 200){
                setItems(response.data.data);
            }else{
                message.error('Gagal Mengambil Data Item!');
            }
        } catch (error) {
            message.error(`Gagal Mengambil Data Item : ${error}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchItems();
    }, [])

    return (
        <DashboardLayout>
            <div>
                <Title level={2}>Daftar Items</Title>
                <Space style={{ marginBottom: 16 }} className="items-center w-full">
                    <Input prefix={<SearchOutlined />} placeholder="Cari Berdasarkan Nama, SKU, atau Barcode" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                    <Button type="primary" onClick={newItem}>
                        Buat Item Baru
                    </Button>
                    <Button type="primary" onClick={fetchItems} icon={<ReloadOutlined/>}>
                        Reload
                    </Button>
                    {selectedRowKeys.length > 0 && <Popconfirm
                        title="Yakin Ingin Menghapus Data Product?"
                        description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                        onConfirm={() => handleDelete(selectedRowKeys as String[])}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger>Hapus</Button>
                    </Popconfirm>}
                </Space>
                <Table dataSource={items?.data} rowSelection={rowSelection} columns={columns} loading={loading} rowKey={(record) => record.product_id} />
            </div>
        </DashboardLayout>
    )
}

export default Items;