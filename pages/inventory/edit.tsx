import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import {
    Button,
    Form,
    Input,
    message,
    Select,
    Breadcrumb,
    InputNumber,
} from "antd";

import { LayoutType } from "@/type/form.layout";
import DashboardLayout from "@/pages/component/DashboardLayout";
import { deleteCookie, getCookie } from "cookies-next";
import { RequestParam } from "@/type/request_param";
import { Inventory } from "@/type/inventory";

const EditInventory: React.FC = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout] = useState<LayoutType>('horizontal');

    const [form] = Form.useForm();

    // ✅ submit update
    const handleSubmit = async () => {
        setLoading(true);

        const inventory_id = getCookie('inventory_id');

        const data = {
            minimum_stock: form.getFieldValue('minimum_stock'),
            price: form.getFieldValue('price'),
            cost: form.getFieldValue('cost'),
            product_name: form.getFieldValue('product_name'),
        };

        try {
            const response = await axiosInstance.put(
                `/inventory/${inventory_id}`,
                data
            );

            if (response.status === 200) {
                deleteCookie('inventory_id');
                message.success(response?.data?.message || 'Data Berhasil Di Ubah');
                window.location.href = '/inventory/' + response.data.data;
            }
        } catch (error: any) {
            
            message.error(error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ ambil detail inventory
    const getDetail = async () => {
        const inventory_id = getCookie('inventory_id');

        if (!inventory_id || inventory_id === 'null') return;

        setLoading(true);

        try {
            const response = await axiosInstance.get(`/inventory/${inventory_id}`);

            if (response.status === 200) {
                const data = response.data.data as Inventory;

                form.setFieldsValue({
                    product_name: data.product_name,
                    location: data.location?.name,
                    quantity: data.quantity,
                    minimum_stock: data.minimum_stock,
                    price: data.price,
                    cost: data.cost,
                    unit_name: data.unit_name,
                });
            }
        } catch (error: any) {
            console.log('error', error);
            message.error(error.response?.data?.message ?? error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDetail();
    }, []);

    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-12"
                items={[
                    { title: 'Home' },
                    { title: 'Inventory', href: '/inventory' },
                    { title: 'Edit Inventory' }
                ]}
            />

            <Form
                layout={formLayout}
                form={form}
                onFinish={handleSubmit}
                disabled={loading}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                style={{ maxWidth: '100%' }}
            >

                {/* 🔹 Info Produk (readonly) */}
                <Form.Item label="Produk" name="product_name">
                    <Input />
                </Form.Item>

                <Form.Item label="Lokasi" name="location">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Satuan" name="unit_name">
                    <Input disabled />
                </Form.Item>

                {/* 🔹 Editable */}
                <Form.Item
                    label="Stock"
                    name="quantity"
                    rules={[{ required: true, message: 'Stock wajib diisi' }]}
                >
                    <InputNumber className="w-full" disabled />
                </Form.Item>

                <Form.Item
                    label="Minimum Stock"
                    name="minimum_stock"
                    rules={[{ required: true, message: 'Minimum stock wajib diisi' }]}
                >
                    <InputNumber className="w-full" />
                </Form.Item>

                <Form.Item
                    label="Harga Jual"
                    name="price"
                    rules={[{ required: true, message: 'Harga wajib diisi' }]}
                >
                    <InputNumber className="w-full" />
                </Form.Item>

                <Form.Item
                    label="Harga Modal"
                    name="cost"
                    rules={[{ required: true, message: 'Cost wajib diisi' }]}
                >
                    <InputNumber className="w-full" />
                </Form.Item>

                {/* 🔹 Action */}
                <Form.Item className="mt-2">
                    <Button href="/inventory" type="link" loading={loading}>
                        Batal
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Simpan
                    </Button>
                </Form.Item>

            </Form>
        </DashboardLayout>
    );
};

export default EditInventory;