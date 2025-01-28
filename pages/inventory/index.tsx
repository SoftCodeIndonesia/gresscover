
import { useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Input, Space } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { Inventory } from "@/type/inventory";
import { DeleteButton, EditButton } from "../component/ButtonComponent";
import DashboardLayout from "../component/DashboardLayout";

import {
    ReloadOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { FormLayout } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import { formatRupiah } from "@/utils/format_rupiah";
import { Item } from "@/type/item";

const { Content } = Layout;

const InventoryPage: React.FC = () => {
    const [inventories, setInventory] = useState<Inventory[]>([]);
    
    const [modal, setModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout] = useState<FormLayout>('vertical');

    const [form] = Form.useForm();

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
            render: (_: any, record: Inventory) => record.item?.photo != null ? <Image
                width={40}
                src={`${process.env.NEXT_PUBLIC_BE}/storage/${record.item?.photo}`}
                fallback="data:image/png;base64,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"
            /> : '',
        },
        {
            title: 'Inventory',
            dataIndex:'item.name', 
            key: 'item.name',
            render: (_:any, record: Inventory) => <p>{record.item?.name}</p>,
        },
        {
            title: 'Dijual',
            dataIndex:'', 
            key: '',
            render: (_:any, record: Inventory) => <p>{`${record.price > 0 ? 'Ya' : 'Tidak'}`}</p>,
        },
        {
            title: 'Harga Jual',
            dataIndex:'', 
            key: '',
            render: (_:any, record: Inventory) => <p>{formatRupiah(parseInt(record.item?.price ?? '0'))}</p>,
        },
        {
            title: 'Stok',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (_:any, record: Inventory) => <p>{`${record.quantity} ${record.item?.unit_name}`}</p>,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Inventory) => (
                <>
                  <EditButton label='Edit'  onClick={() => handleEdit(item)}/>
                  <DeleteButton label='Hapus' onComfirm={() => handleDelete(item)} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    
    
    const handleEdit = (inventory: Inventory) => {

    }

    const handleDelete = (inventory: Inventory) => {

    }

    const cancelModal = () => {
        form.resetFields();
        setModal(false);
    }

    const handleSubmit = async (values: any) => {

    }

    const getInventories = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/inventory');

            if(response.status == 200){
                setInventory(response.data.data);
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
            <Button icon={<PlusOutlined/>} type="link" href="inventory/add" className="my-3 bg-blue-600 text-white" >Tambah</Button>
            <Button icon={<ReloadOutlined/>} type="default" onClick={getInventories} className="my-3" >Reload</Button>
            </Space>
            <Table columns={columns} loading={loading} dataSource={inventories} rowKey={(record) => record.inventory_id} />


            <Modal
                title="Tambah Inventory"
                visible={modal}
                onCancel={cancelModal}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    
                    //   initialValues={{ layout: formLayout }}
                    style={{ maxWidth: '100%' }}
                    layout={formLayout}

                >
                <Form.Item
                    label="Nama Supplier"
                    name="name"
                    rules={[{ required: true, message: 'Please input the supplier name!' }]}
                >
                    <Input placeholder='Masukan Nama Supplier' />
                </Form.Item>
                <Form.Item
                    label="Nama Kontak"
                    name="contact_name"
                    rules={[{ required: true, message: 'Please input the contact name!' }]}
                >
                    <Input placeholder='Masukan Nama Kontak' />
                </Form.Item>
                <Form.Item
                    label="Nomor Telepon"
                    name="phone"
                    rules={[{ required: true, message: 'Please input the phone number!' }]}
                >
                    <Input placeholder='6288282827362' />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Invalid email' }]}
                >
                    <Input placeholder='example@gmail.com' />
                </Form.Item>
                <Form.Item
                    label="Address"
                    name="address"
                >
                    <TextArea />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                    Kirim
                    </Button>
                </Form.Item>
                </Form>
            </Modal>    
        </DashboardLayout>
    );
};


export default InventoryPage;
