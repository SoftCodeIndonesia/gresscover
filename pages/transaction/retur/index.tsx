import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import { RequestParam } from "@/type/request_param";
import { Retur } from "@/type/retur";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Button, Dropdown, message, Popconfirm, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import {
    ReloadOutlined,
    PlusOutlined,
    SettingFilled
} from '@ant-design/icons';
import axiosInstance from "@/utils/axiosInstance";
import { Pagination } from "@/type/pagination";
import { formatRupiah } from "@/utils/format_rupiah";
import { deleteCookie, setCookie } from "cookies-next";
import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import { useRouter } from "next/router";
import Link from "next/link";
import { TableRowSelection } from "antd/es/table/interface";
const ReturPage: React.FC = () => {
    const [requestParam, setRequestParam] = useState<RequestParam>({
        table: 'retur',
        request_column: ["retur_id","retur_number", "delivery_number", "status", "delivery_fee", "type"],
        request_column_relation: [],
        limit: 10,
        page: 1,

    });

    const [returs, setRetur] = useState<Pagination<Retur>>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const showStatus = (_: any, record: Retur, index: number) => {
        if(record.status == 'draft'){
            return <Tag color="default">DRAFT</Tag>;
        }else if(record.status == 'proses pengembalian'){
            return <Tag color="processing">PROSES PENGEMBALIAN</Tag>;
        }else if(record.status == 'selesai'){
            return <Tag color="success">SELESAI</Tag>
        }
    }

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: Retur, index: number) => <p>{index + 1}</p>,
        },
        {
            title: 'No Retur',
            dataIndex: 'retur_number',
            key: 'retur_number',
            render: (_: any, record: Retur, index: number) => <Link href={`retur/${record.retur_id}`} ><p className="text-blue-500">#{record.retur_number}</p></Link>,
        },
        {
            title: 'Type',
            dataIndex:'type', 
            key: 'type',
            render: (_: any, record: Retur, index: number) => <p>{capitalizeEachWord(record.type)}</p>,
        },
        {
            title: 'Nomor Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            
        },
        {
            title: 'Biaya Pengiriman',
            dataIndex:'delivery_fee', 
            key: 'delivery_fee',
            render: (_: any, record: Retur, index: number) => <p>{formatRupiah(record.delivery_fee)}</p>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: showStatus,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Retur) => (
                <Dropdown menu={{
                    items:[
                        {
                          key: '1',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'proses pengembalian'} label="Proses Pengembalian" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'proses pengembalian')} onCancel={() => {}} />
                          ),
                          disabled: item.status == 'proses pengembalian',
                         
                        },
                        {
                          key: '2',
                          label: (
                            <CustomButtonPopConfirm disabled={item.status == 'selesai'} label="Selesai" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus([item], 'selesai')} onCancel={() => {}} />
                          ),
                         disabled: item.status == 'selesai',
                        },
                        {
                            key: '4',
                            label: (
                              <Button type="link" href="retur/add_retur" onClick={() => handleEdit(item)} >Edit</Button>
                            ),
                            onClick:() => handleEdit(item),
                        },
                        {
                            key: '5',
                            label: (
                                <DeleteButton label='Hapus' onComfirm={() => handleDelete([item.retur_id!])} okText='Hapus' cancelText='Batal' />
                            ),
                        },
                    ]
                }}>
                    <SettingFilled />
                </Dropdown>
              ),
        },
    ];

    const handleDelete = async (data: string[]) => {
        setLoading(true);
        try {

            

            console.log(data);
            
            const response = await axiosInstance.post(`/retur/del`, {data: data});

            if(response.status == 200){
                message.success('Berhasil!');
                // router.back();
                getRetur();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }
    const handleEdit = (data: Retur) => {
        setCookie('retur_id', data.retur_id);
        // router.push('retur/add_retur');
    }

    const handleUpdateStatus = async (record: Retur[], status: string) => {
       
        setLoading(true);
        try {

            const data: {
                retur_id: string,
                status: string,
            }[] = record.map((value) => ({
                "retur_id": value.retur_id,
                "status": status,
            }))

            console.log(data);
            
            const response = await axiosInstance.post(`/retur/status`, {data: data});

            if(response.status == 200){
                message.success('Berhasil!');
                getRetur();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getRetur = async () => {
        setLoading(true);
        try {
            const request: RequestParam = {
                table: 'retur',
                request_column: ["retur_id","retur_number", "delivery_number", "status", "delivery_fee", "type"],
                request_column_relation: [],
                limit: 10,
                page: 1,
            };
            const response = await axiosInstance.post('/search', request);

            if(response.status == 200){
                setRetur(response.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Retur> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    useEffect(() => {
        getRetur();
    }, []);
    

    return (
        <DashboardLayout>
            <Space className="gap-3">
                <Button icon={<PlusOutlined/>} type="primary" href="retur/add_retur" onClick={() => {
                    deleteCookie('sale_id');
                    deleteCookie('retur_id');
                }} className="my-3 bg-blue-600 text-white" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={getRetur} className="my-3" >Reload</Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Retur?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Table columns={columns} loading={loading} rowSelection={rowSelection} dataSource={returs?.data ?? []} pagination={false} rowKey={(record) => record.retur_id} />
        </DashboardLayout>
    )
}

export default ReturPage;