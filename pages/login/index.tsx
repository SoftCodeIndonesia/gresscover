
import { User } from "@/type/user";
import { Button, Card, Form, FormProps, Input, Layout, message } from "antd"
import axiosInstance from '@/utils/axiosInstance';
import { setCookie } from "cookies-next";
import React, { useState, useEffect } from "react";
import { Tax } from "@/type/tax";
import { GroupSetting } from "@/type/setting";

type FieldLoginType = {
    email: string,
    password: string,
}

type AuthResponse = {
    user: {
        data: User,
        taxes: Tax[],
        settings: GroupSetting[],
    };
    permission: string[],
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
            const response = await axiosInstance.post(`/login`, {'email': values.email, 'password': values.password});
            if(response.status == 200){

                const data = response.data as AuthResponse;

                console.log(data);
                
                setCookie('token', data.access_token);
                setCookie('user', JSON.stringify(data.user.data));

                message.success('Login Berhasil');

                localStorage.setItem("taxs", JSON.stringify(data.user.taxes))
                localStorage.setItem("settings", JSON.stringify(data.user.settings))
                localStorage.setItem("permissions", JSON.stringify(data.permission));

                window.location.href = '/dashboard';
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
