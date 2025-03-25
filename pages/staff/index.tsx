import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Spin, Alert, Button, Form, Modal, Input, message, Space, Popconfirm } from 'antd';
import { Staff, StaffList } from '@/type/staff';
import { getCookie } from 'cookies-next';
import axiosInstance from '@/utils/axiosInstance';
import DashboardLayout from '../component/DashboardLayout';

import { formatDate } from '@/utils/date_utils';
import Link from 'next/link';
import { useForm } from 'antd/es/form/Form';

const { Title } = Typography;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
};
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { TableRowSelection } from 'antd/es/table/interface';

const StaffPage = () => {
    const [staff, setStaff] = useState<StaffList>([]);
    const [loading, setLoading] = useState(true);
    const [searchkeyword, setSearchText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null); // Menyimpan data staff yang sedang diedit
    const [form] = Form.useForm();
    const token = getCookie('token');

    const filteredData = staff.filter((data) =>
        data.user.name.toLowerCase().includes(searchkeyword) ||
        data.user.email?.toLowerCase().includes(searchkeyword) ||
        data.user.telephone?.toLowerCase().includes(searchkeyword) ||
        formatDate(data.hire_date).toLowerCase().includes(searchkeyword) ||
        formatDate(data.created_at).toLowerCase().includes(searchkeyword) ||
        formatDate(data.updated_at).toLowerCase().includes(searchkeyword) ||
        data.creator?.name?.toLowerCase().includes(searchkeyword)
    );

    const handleEdit = (record: any) => {
        setEditingStaff(record);
        form.setFieldsValue({
            name: record.user.name,
            email: record.user.email,
            hire_date: record.hire_date,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (staffId: string[]) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/staff/delete`, {data: staffId});
            if(response.status == 200){
                message.success("Data Berhasil Di Hapus");
                setSelectedRowKeys([]);
                fetchStaff(); // Refresh data setelah delete
            }
        } catch (err) {
            message.error(`${err}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setIsModalVisible(true); 
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            
            

            if(editingStaff == null){
                var response = await axiosInstance.post('/staff', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if(response.status == 200){
                    message.success("Berhasil Menambahkan Data");
                    fetchStaff(); // Refresh data setelah submit
                    setIsModalVisible(false); // Sembunyikan modal
                }else{
                    message.error("Gagal Menambahkan Data");
                }
            }else{
                values.id = editingStaff.user.id;
                var response = await axiosInstance.put('/staff', values, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if(response.status == 200){
                    message.success("Berhasil Mengubah Data");
                    fetchStaff(); // Refresh data setelah submit
                    setIsModalVisible(false); // Sembunyikan modal
                }else{
                    message.error("Gagal Mengubah Data");
                }
            }

            

            
        } catch (err) {
            message.error(`${err}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get<StaffList>('/staff', {
                headers: {
                    Authorization: `Bearer ${token}`, // Set header Authorization
                },
            }); // Ubah URL sesuai dengan API Anda
            if(response.status === 200){
                setStaff(response.data);
            }
        } catch (err) {
            message.error('Failed to fetch staff data.');
        } finally {
            setLoading(false);
        }
    };

    const modalClose = () => {
        setEditingStaff(null);
        setIsModalVisible(false);
    }

    useEffect(() => {
       

        fetchStaff();
    }, []);

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: ['user', 'name'], // Mengakses nama dari objek user
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'], // Mengakses email dari objek user
            key: 'email',
        },
        {
            title: 'Tgl Join',
            dataIndex: 'hire_date',
            key: 'hire_date',
        },
        {
            title: 'Dibuat tgl',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_:any, record: Staff) => formatDate(record.created_at),
        },
        {
            title: 'Diubah tgl',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (_:any, record: Staff) => formatDate(record.updated_at),
        },
        {
            title: 'Dibuat oleh',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (_:any, record: Staff) => <p>{record.creator?.name}</p>
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (text: any, record: Staff) => (
                <div className='flex gap-3 items-center'>
                    <Typography.Link href={`/staff/${record.staff_id}`}>
                        Lihat Detail
                    </Typography.Link>
                    <Button type='link' onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type='link' danger onClick={() => handleDelete([record.staff_id])}>Delete</Button>
                </div>
            ),
        },
    ];

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Staff> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    

    
    if (error) return <Alert message={error} type="error" />;

    return (
        <DashboardLayout>
            <div>
                <Title level={2}>Daftar Karyawan</Title>
                <Space className='mb-4'>
                <Input prefix={<SearchOutlined />} placeholder="Cari Daftar Karyawan" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                    <Button type="primary" onClick={handleAdd}>
                        Buat Karyawan Baru
                    </Button>
                    <Button type="primary" onClick={fetchStaff} icon={<ReloadOutlined/>}>
                            Reload
                    </Button>
                    {selectedRowKeys.length > 0 && 
                                        <Popconfirm
                                        title="Yakin Ingin Menghapus Data User?"
                                        description="Data yang sudah dihapus tidak bisa di pulihkan!"
                                        onConfirm={() => handleDelete(selectedRowKeys as string[])}
                                        onCancel={() => {}}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button type="primary" danger>Hapus</Button>
                                    </Popconfirm>
                    }
                </Space>
                <Table dataSource={filteredData} rowSelection={rowSelection} scroll={{x: 'max-content'}} columns={columns} loading={loading} rowKey={(record) => record.staff_id.toString()} />
            </div>

            <Modal
                title={editingStaff ? "Edit Data Staff" : "Buat Staff Baru"}
                visible={isModalVisible}
                onCancel={modalClose}
                confirmLoading={loading}
                footer={null}
            >
                <Form form={form} disabled={loading} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input Name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input disabled={editingStaff != null} />
                    </Form.Item>
                    {editingStaff == null && <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input Password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>}
                    <Form.Item
                        label="Tgl Join"
                        name="hire_date"
                        rules={[{ required: true, message: 'Please input Hire Date!' }]}
                    >
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Simpan
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

export default StaffPage;
