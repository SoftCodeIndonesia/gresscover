import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Spin, Alert, Button, Form, Modal, Input, message } from 'antd';
import { Staff, StaffList } from '@/type/staff';
import { getCookie } from 'cookies-next';
import axiosInstance from '@/utils/axiosInstance';
import DashboardLayout from '../component/DashboardLayout';
import { render } from 'react-dom';
import { formatDate } from '@/utils/date_utils';
import Link from 'next/link';
import { useForm } from 'antd/es/form/Form';

const { Title } = Typography;

const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 16 },
};
  

const StaffPage = () => {
    const [staff, setStaff] = useState<StaffList>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null); // Menyimpan data staff yang sedang diedit
    const [form] = Form.useForm();
    const token = getCookie('token');


    const handleEdit = (record: any) => {
        setEditingStaff(record);
        form.setFieldsValue({
            name: record.user.name,
            email: record.user.email,
            hire_date: record.hire_date,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (staffId: string) => {
        setLoading(true);
        try {
            const token = getCookie('token');
            await axiosInstance.delete(`/staff/${staffId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchStaff(); // Refresh data setelah delete
        } catch (err) {
            message.error("Failed Delete Staff");
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
            message.error("Gagal Menambahkan Data");
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
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
            title: 'Hire Date',
            dataIndex: 'hire_date',
            key: 'hire_date',
        },
        {
            title: 'Dibuat Pada',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (_:any, record: Staff) => formatDate(record.created_at),
        },
        {
            title: 'Diupdate pada',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (_:any, record: Staff) => formatDate(record.updated_at),
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
                    <Button type='link' danger onClick={() => handleDelete(record.staff_id)}>Delete</Button>
                </div>
            ),
        },
    ];

    
    if (error) return <Alert message={error} type="error" />;

    return (
        <DashboardLayout>
            <div>
                <Title level={2}>Staff List</Title>
                <Button type="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
                    Buat Staff Baru
                </Button>
                <Table dataSource={staff} columns={columns} loading={loading} rowKey={(record) => record.staff_id.toString()} />
            </div>

            <Modal
                title={editingStaff ? "Edit Data Staff" : "Buat Staff Baru"}
                visible={isModalVisible}
                onCancel={modalClose}
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
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please input Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input />
                    </Form.Item>
                    {editingStaff == null && <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input Password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>}
                    <Form.Item
                        label="Hire Date"
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
