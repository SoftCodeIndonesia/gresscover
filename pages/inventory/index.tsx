
import { useEffect, useState } from "react";
import { Layout, Table, message, Image, Button, Modal, Form, Input, Space, Tag } from "antd";
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
            title: 'Inventory',
            dataIndex:'item.name', 
            key: 'item.name',
            render: (_:any, record: Inventory) => <p>{record.item?.name}</p>,
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
            render: (_:any, record: Inventory) => <p>{formatRupiah(parseInt(record.item?.price ?? '0'))}</p>,
        },
        {
            title: 'Stok',
            dataIndex: 'stock_quantity',
            key: 'stock_quantity',
            render: (_:any, record: Inventory) => record.quantity == 0 ? <Tag color="#f50">Habis</Tag> : record.quantity + ' ' + record.item?.unit_name
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
