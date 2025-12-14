import { useEffect, useState } from "react";
import { Button, Form, Input, message, Space, Typography } from "antd";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { getCookie, setCookie } from "cookies-next";
import { ReloadOutlined } from "@ant-design/icons";

const { Title } = Typography;

const VendorAdd = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const vendorId = getCookie("vendor_id"); // if exists → edit mode
    const [isEditMode, setEditMode] = useState(false);

    const fetchVendor = async () => {
        if (!vendorId) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`/vendors/${vendorId}`);

            if (res.status === 200) {
                form.setFieldsValue(res.data.data);
            } else {
                message.error("Gagal mengambil data vendor!");
            }
        } catch (error) {
            message.error(`Gagal mengambil data vendor: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                id: vendorId != 'null' ? vendorId : null,
            };

            const res = await axiosInstance.post("/vendors", payload);

            if (res.status === 200) {
                message.success(`Vendor berhasil ${isEditMode ? "diperbarui" : "ditambahkan"}!`);
                setCookie("vendor_id", null);
                window.location.href = "/vendor";
            } else {
                message.error("Gagal menyimpan vendor!");
            }
        } catch (error) {
            console.error(error);
            message.error("Gagal menyimpan vendor!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        if(vendorId != 'null'){
            fetchVendor();
            setEditMode(true);
        }else{
            setEditMode(false);
        }
    }, []);

    return (
        <DashboardLayout>
            <Title level={3}>
                {isEditMode ? "Edit Vendor" : "Tambah Vendor"}
            </Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    label="Nama Vendor"
                    name="name"
                    rules={[{ required: true, message: "Nama vendor wajib diisi!" }]}
                >
                    <Input placeholder="Masukkan nama vendor" />
                </Form.Item>

                <Form.Item
                    label="Alamat"
                    name="address"
                    
                >
                    <Input.TextArea rows={3} placeholder="Masukkan alamat vendor" />
                </Form.Item>

                <Form.Item
                    label="Nomor Telepon"
                    name="phone"
                    
                >
                    <Input placeholder="0812xxxxxx" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { type: "email", message: "Format email tidak valid!" },
                       
                    ]}
                >
                    <Input placeholder="vendor@email"/>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode ? "Update" : "Simpan"}
                        </Button>

                        <Button onClick={() => (window.location.href = "/vendors")}>
                            Kembali
                        </Button>

                        {isEditMode && (
                            <Button icon={<ReloadOutlined />} onClick={fetchVendor}>
                                Reload Data
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Form>
        </DashboardLayout>
    );
};

export default VendorAdd;
