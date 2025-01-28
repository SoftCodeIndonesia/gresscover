import { Permission } from "@/type/permission";
import axiosInstance from "@/utils/axiosInstance";
import {
    PlusCircleOutlined,
    ReloadOutlined,
    SearchOutlined,
  } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import Title from "antd/es/typography/Title";
import TextArea from "antd/es/input/TextArea";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox/Checkbox";

const HakAksesMenu = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalShow, setModal] = useState<boolean>(false);
    const [data_permissions, setPermissions] = useState<Permission[]>([]);
    const [permission, setSinglePermission] = useState<Permission | null>(null);
    const [ids, setSelected] = useState<number[]>([]);

    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    

    
    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const filteredData = data_permissions.filter((staff) =>
        staff.name.toLowerCase().includes(searchText) ||
        staff.name.toLowerCase().includes(searchText)
    );

  

    const columns = [
        {
            title: <Checkbox onChange={(e) => onSelectAll(e)}></Checkbox>,
            render: (_: any, record: Permission) => <Checkbox checked={ids.includes(record.id)} value={record.id} onChange={handleCheckboxClick}></Checkbox>,
        },
        {
            title: 'Hak Akses',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Aksi',
            dataIndex: '',
            key: '',
            render: (_: any, record: Permission) => <Space>
                <Button type='primary' onClick={() => handleEdit(record)}>Edit</Button>
                <Popconfirm
                    title="Hapus Data Hak Akses!"
                    description="Anda Yakin Ingin Menghapus Data Hak Akses?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Ya"
                    cancelText="Tidak"
                >
                    <Button type='primary' danger>Delete</Button>
                </Popconfirm>
                
            </Space>
        },
    ]

    const handleCheckboxClick = async (e: CheckboxChangeEvent) => {
        setSelected((prev) =>
            e.target.checked ? [...prev, e.target.value] : prev.filter((item) => item !== e.target.value)
        );
    }

    const onSelectAll = async (e: CheckboxChangeEvent) => {
        setSelected(e.target.checked  ? data_permissions.map((item) => item.id) : []);
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            var response = await axiosInstance.delete(`/permission/${id}`);
            if(response.status == 200){
                message.success("Data Berhasil Dihapus!");
                fetchPermissions();
            }else{
                message.error("Data Gagal Dihapus!");
            }
        } catch (error) {
            message.error("Data Gagal Dihapus!");
        }finally {
            setLoading(false);
        }
    }
    const handleEdit = (data: Permission) => {
        setSinglePermission(data);
        form.setFieldsValue({
            name: data.name,
            description: data.description,
        });
        setModal(true);
    }

    const cancleModal = () => {
        setModal(false);
        form.resetFields();
    }

    

    const handleSubmit = async (values: any) => {
       
        setLoading(true);
        try {
            
            
            
            if(permission){
                values = {...values, id: permission.id};
            }

            var response = await axiosInstance.post('/permission', values);

            if(response.status == 200){
                message.success("Berhasil");
                fetchPermissions();
            }else{
                message.error("Gagal");
            }
        } catch (error) {
            message.error("Gagal");
        }finally {
            setLoading(false);
            setModal(false);
            form.resetFields();
        }
    }

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            var response = await axiosInstance.get('/permission');
            if(response.status == 200){
                setPermissions(response.data.data);
            }else{
                message.error("Gagal Mengambil Data Permission");
            }
        } catch (error) {
            message.error("Gagal Mengambil Data Permission");
        }finally {
            setLoading(false);
        }
    }

    const handleDeleteBulk = async () => {
        setLoading(true);
        try {
            var response = await axiosInstance.post(`/permission_bulk`, {"ids": ids});
            if(response.status == 200){
                message.success("Data Berhasil Dihapus!");
                fetchPermissions();
            }else{
                message.error("Data Gagal Dihapus!");
            }
        } catch (error) {
            message.error("Data Gagal Dihapus!");
        }finally {
            setLoading(false);
        }
    }


    
    useEffect(() => {
        fetchPermissions();
    }, [])

    return (
        <DashboardLayout>
            <div>
                <Title level={2}>Daftar Hak Akses</Title>
                <Space style={{ marginBottom: 16 }}>
                    <Input prefix={<SearchOutlined />} placeholder="Cari Hak Akses" onChange={(e) => handleSearch(e.target.value)}/>
                    <Button type="primary" htmlType="button" onClick={fetchPermissions} loading={loading} icon={<ReloadOutlined />}>Reload</Button>
                    <Button type="primary" htmlType="button" className="bg-green-600" onClick={()=> setModal(true)} loading={loading} icon={<PlusCircleOutlined />}>Buat Baru</Button>
                    
                    {ids.length > 0 && <Popconfirm
                    title="Hapus Data Hak Akses!"
                    description="Anda Yakin Ingin Menghapus Data Hak Akses?"
                    onConfirm={handleDeleteBulk}
                    okText="Ya"
                    cancelText="Tidak"
                >
                    <Button type="primary" htmlType="button" className="bg-red-600" loading={loading}>Hapus</Button>
                </Popconfirm>}
                
                </Space>
                <Table columns={columns} loading={loading} dataSource={filteredData} rowKey={(record) => record.id.toString()} />
                <Modal
                    title={permission ? "Edit" : "Buat Hak Akses Baru"}
                    visible={modalShow}
                    onCancel={cancleModal}
                    confirmLoading={loading}
                    footer={null}
                >
                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input Name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Deskripsi"
                            name="description"
                            
                        >
                            <TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button loading={loading} type="primary" htmlType="submit">
                                Simpan
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </DashboardLayout>
    )
}


export default HakAksesMenu;