
import { User } from "@/type/user";
import { Button, Card, Flex, Form, FormProps, Input, Layout, message, Result } from "antd"
import axiosInstance from '@/utils/axiosInstance';
import { setCookie } from "cookies-next";
import React, { useState, useEffect } from "react";
import { Tax } from "@/type/tax";
import { GroupSetting } from "@/type/setting";
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
type FieldLoginType = {
    email: string,
    password: string,
}


const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [layout_state, setLayoutState] = useState<string>('email');
    

    const onFinish = async (values: FieldLoginType) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/forgot-password`, {'email': values.email});
            if(response.status == 200){
                form.resetFields();
                message.success('Kami Telah Mengirimkan Email Verifikasi Anda!');
                setLayoutState('success');
            }else if(response.status == 401){
                message.error(response.data['message']);
            }
        } catch (error: any) {
            
            if(error.response && error.response.status === 401){
                message.error(`${error.response.data.message}`);
            }else{
                console.log(error);
                message.error(`Gagal Masuk ==> ${error.response?.data?.message ?? error}`);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Layout style={{height: '100vh'}} className="flex items-center justify-center">
            {layout_state == 'success' && <Result
                        status="success"
                        title="Email Verifikasi Telah Terkirim!"
                        subTitle="Kami Telah Mengirimkan Link Untuk Mengubah Password Anda!"
                        
                    />}
            {layout_state == 'email' && <Card title="Forgot Password" bordered={false} style={{ width: 360 }}>
                <Form
                    name="basic"
                    form={form}
                    // {...layout}
                    onFinish={onFinish}
                >
                    <Form.Item<FieldLoginType>
                        name="email"
                        rules={[{ required: true, message: 'Masukan alamat email!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Masukan Alamat Email Anda" />
                    </Form.Item>

                    <Form.Item >
                        <Button block type="primary" htmlType="submit" loading={loading}>
                            Masuk
                        </Button>
                    </Form.Item>
                </Form>
            </Card>}
        </Layout>
    )
}
export default ForgotPassword;
