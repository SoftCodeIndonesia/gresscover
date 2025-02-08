import { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, DatePicker, Collapse, Radio } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";
import { TableRowSelection } from "antd/es/table/interface";
import { object } from "zod";
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import Column from "antd/es/table/Column";
import { Tax } from "@/type/tax";
import DashboardLayout from "../component/DashboardLayout";

interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    stok: number|null, 
    quantity: number|null, 
    sku: string|null, 
    selling_price: number|null, 
    selling_price_string: string|null, 
    cost: number|null, 
    cost_string: string|null, 
    minimum: number|null,
    checked: boolean,
    unit_id: string|null,
    unit_name: string|null,
    type?: string|null,
    inventory_id: string|null,
    // children: TableInventory[],
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

const addTransaction = () => {
    
    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout, setFormLayout] = useState<LayoutType>('horizontal');
    

    
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        setLoading(true);
        
        

        const data = {
            
            'total_amount': form.getFieldValue('total_amount'),
            'status': form.getFieldValue('status'),
            'type': form.getFieldValue('type'),
        }

        console.log(data);
        try {
            const response = await axiosInstance.post('/transaction', data);
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                form.resetFields();
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }

    
    

    useEffect(() => {
       
    }, []);


    
    
    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-12"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Daftar Transaksi',
                        href: '/transaction',
                    },
                    {
                        title: `Tambah Transaksi`,
                    }
                ]}
            />
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '100%' }}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                onFinish={handleSubmit}
                disabled={loading}
            >
                
                <Form.Item label="Jenis Transaksi" name="type">
                    <Radio.Group>
                        <Radio value="income"> Pengeluaran </Radio>
                        <Radio value="expense"> Pemasukan </Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="Jumlah" name="total_amount" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                    <Input placeholder="Jumlah Transaksi" onChange={(e) => handlePriceChange(e.target.value == '' ? '0' : e.target.value)} />
                </Form.Item>
                
                <Form.Item name="status" label="Status Transaksi" rules={[{ required: true , message: 'Please input status pesanan!'}]}>
                    <Select
                        placeholder="Status"
                        options={[
                            {value: 'draft', label: 'DRAFT'},
                            {value: 'pending', label: 'PENDING'},
                            {value: 'completed', label: 'SELESAI'},
                            {value: 'cancel', label: 'BATAL'},
                        ]}
                        allowClear
                    >
                    </Select>
                </Form.Item>
                
                
                <Form.Item className="mt-2">
                        <Button type="link" href="/transaction" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
        </DashboardLayout>
    );
}


export default addTransaction;