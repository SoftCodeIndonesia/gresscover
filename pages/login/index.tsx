
import { User } from "@/type/user";
import { Button, Card, Form, FormProps, Input, Layout, message } from "antd"
import axiosInstance from '@/utils/axiosInstance';
import { setCookie } from "cookies-next";
import React, { useState, useEffect } from "react";

type FieldLoginType = {
    email: string,
    password: string,
}

type AuthResponse = {
    user: User;
    access_token: string;
    token_type: string;
};

const layout = {
    labelCol:{ span: 8 },
    wrapperCol:{ span: 10 },
};

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    
    

    const onFinish = async (values: FieldLoginType) => {
        setLoading(true);
        try {
            var response = await axiosInstance.post(`/login`, {'email': values.email, 'password': values.password});
            if(response.status == 200){

                var data = response.data as AuthResponse;
                
                setCookie('token', data.access_token);
                setCookie('user', JSON.stringify(data.user));

                message.success('Login Berhasil')

                window.location.href = '/dashboard';
            }else if(response.status == 401){
                message.error(response.data['message']);
            }
        } catch (error: any) {
            
            if(error.response && error.response.status === 401){
                message.error(`${error.response.data.message}`);
            }else{
                message.error(`Gagal Masuk ==> ${error}`);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Layout style={{height: '100vh'}} className="flex items-center justify-center">
            <Card title="Masuk" bordered={false} style={{ width: 600 }}>
                <Form
                    name="basic"
                    form={form}
                    {...layout}
                    onFinish={onFinish}
                >
                    <Form.Item<FieldLoginType>
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Masukan alamat email!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldLoginType>
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Masukan password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </Layout>
    )
}
export default LoginPage;
