import { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import { Category } from "@/type/category";
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Typography } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';

import { LayoutType } from "@/type/form.layout";
import TextArea from "antd/es/input/TextArea";

const CategoryPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, isLoading] = useState<boolean>(false);
    const [isModalOpen, setModal] = useState<boolean>(false);
    const [searchkeyword, setSearchText] = useState<string>('');
    const [category_id, setEdit] = useState<string|null>(null);
    const [formLayout] = useState<LayoutType>('vertical')

    const [form] = Form.useForm();

    const filteredData = categories.filter((data) =>
        data.name.toLowerCase().includes(searchkeyword) ||
        data.description?.toLowerCase().includes(searchkeyword)
    );

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    var column = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: Category, index: number) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Aksi',
            dataIndex: '',
            key: '',
            render: (_: any, record: Category, index: number) => <div className='flex gap-3 items-center'>
                <Button type='link' className="text-yellow-500" onClick={() => handleEdit(record)}>Edit</Button>
                <Popconfirm title="Hapus Item" cancelText="Batal" onConfirm={() => handleDelete(record.category_id)} okText="Hapus" description={`Anda Yakin Ingin Menghapus Item Ini?`}>

                    <Button type='link' danger>Delete</Button>

                </Popconfirm>
            </div>
        },
        
    ]

    const handleEdit = (category: Category) => {
        form.setFieldsValue({
            "name": category.name,
            "description": category.description
        });
        setEdit(category.category_id);
        toogleModal();
    }

    const handleDelete = async (id: string) => {
        isLoading(true);
        try {
            var response = await axiosInstance.delete(`/category/${id}`);
            if(response.status == 200){
                fetchCategories();
            }else{
                message.error(`Gagal Mengambil Data => ${response.statusText}`)
            }
        } catch (error) {
            message.error("Gagal Mengambil Data!")
        } finally {
            isLoading(false);
        }
    }

    const fetchCategories = async () => {
        isLoading(true);
        try {
            var response = await axiosInstance.get("/category");
            if(response.status == 200){
                setCategories(response.data.data);
            }else{
                message.error(`Gagal Mengambil Data => ${response.statusText}`)
            }
        } catch (error) {
            message.error("Gagal Mengambil Data!")
        } finally {
            isLoading(false);
        }
    }

    const submitCategory = async () => {
        const values = form.getFieldsValue();
        console.log(values);
        isLoading(true);
        try {
            
            interface Values {
                name: string,
                description: string|null,
                category_id?: string,
            }

            const data: Values = {
                name: values.name,
                description: values.description,
            };

            if(category_id != null){
                data.category_id = category_id;
            }


            var response = await axiosInstance.post('/category', data);
            if(response.status == 200){
                fetchCategories();
                
                toogleModal();
            }else{
                message.error("Gagal Menambahkan Kategori!");
            }
        } catch (error) {
            message.error("Gagal Menambahkan Kategori!");
        } finally {
            isLoading(false);
        }
    }

    const toogleModal = () => {
        if(isModalOpen){
            form.resetFields();
            setModal(false);
        }else{
            setModal(true);
        }
    }


    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <DashboardLayout>
            <div>
                <Space style={{ marginBottom: 16 }} className="items-center w-full">
                    <Input prefix={<SearchOutlined />} placeholder="Cari Berdasarkan Nama" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                    <Button type="primary" onClick={toogleModal} className="bg-green-600 hover:bg-green-600 text-white">
                        Buat Kategori Baru
                    </Button>
                    <Button type="primary" onClick={fetchCategories} icon={<ReloadOutlined/>} className="bg-blue-400 hover:bg-blue-400 text-white">
                        Reload
                    </Button>
                </Space>
                <Table columns={column} dataSource={filteredData} rowKey={(record: Category) => record.category_id} /> 
                <Modal title="Basic Modal" confirmLoading={loading} open={isModalOpen} onOk={submitCategory} onCancel={toogleModal}>
                    <Form
                        layout={formLayout}
                        form={form}
                        initialValues={{ layout: formLayout }}
                        style={{ maxWidth: '100%' }}
                        className="flex flex-col"
                        onFinish={submitCategory}
                        disabled={loading}
                    >
                        <Form.Item label="Kategori" name="name" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                            <Input placeholder="Masukan Nama Kategori" />
                        </Form.Item>
                        <Form.Item label="Deskripsi" name="description">
                            <TextArea placeholder="Masukan Deskripsi Kategori" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default CategoryPage;