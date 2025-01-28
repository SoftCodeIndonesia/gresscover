import { Staff } from "@/type/staff"
import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, Input, message, Space, Table } from "antd";
import Column from "antd/es/table/Column";
import { getCookie } from "cookies-next";

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"

type StaffDetailProps = {
    data: Staff | null,
}

const layout = {
    labelCol: { span: 2 },
};

const StaffInformation: React.FC<StaffDetailProps> =  ({data}) => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [editState, setEdit] = useState<boolean>(false);
    const [staff, setStaff] = useState<Staff|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    const token = getCookie('token');

    const router = useRouter();

    const startEditable = () => setEdit(true);
    const closeEditable = () => setEdit(false);

    const toggleEdit = () => editState ? closeEditable() : startEditable();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            
            
            values.id = staff?.user.id;
            var response = await axiosInstance.put('/staff', values, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if(response.status == 200){
                message.success("Berhasil Mengubah Data");
            }else{
                message.error("Gagal Mengubah Data");
            }
            
        } catch (err) {
            message.error("Gagal Mengubah Data");
        } finally {
            setLoading(false);
            closeEditable();
        }
    };

    const details = async () => {
        
        setLoading(true);
      
        try {
            var response = await axiosInstance.get(`/staff/${slug}`);
            if(response.status == 200){
                setStaff(response.data.data);
                form.setFieldsValue({
                    name: response.data.data.user.name,
                    email: response.data.data.user.email,
                    hire_date: response.data.data.hire_date,
                });
            }
        } catch (error) {
            console.log('response', error);
            message.error("Gagal Mendapatkan Informasi Staff");
        } finally {
            setLoading(false);
        }
    }


    

    useEffect(() => {
        if(data){
            setStaff(data);
            form.setFieldsValue({
                name: data!.user.name,
                email: data!.user.email,
                hire_date: data!.hire_date,
            });
        }
    }, [data]);
    
    
    
    return (
        <Form form={form} {...layout} className="w-full flex flex-col gap-3" onFinish={handleSubmit} layout="horizontal">
            <Form.Item
                
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please input Name!' }]}
                
            >
                <Input disabled={!editState} />
            </Form.Item>
            <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: 'Please input Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
            >
                <Input disabled={!editState} />
            </Form.Item>
            <Form.Item
                label="Hire Date"
                name="hire_date"
                rules={[{ required: true, message: 'Please input Hire Date!' }]}
            >
                <Input type="date" disabled={!editState} />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button htmlType="button" onClick={toggleEdit}>
                        {editState ? 'Batal' : 'Edit'}
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={!editState}>
                        Submit
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}


export default StaffInformation;