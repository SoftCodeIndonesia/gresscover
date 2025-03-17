import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, FormProps, Input, message } from "antd";
import { deleteCookie } from "cookies-next";
import { useState } from "react";
type ChangePasswordForm = {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
};


const ChangePassword: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const onFinish: FormProps<ChangePasswordForm>['onFinish'] =  async (values) => {
        // console.log('Success:', values);
        setLoading(true);
        try {

            const response = await axiosInstance.put(`/user/change_password`, values);

            if(response.status == 200){
                message.success("Kata Sandi Berhasil Di Ubah!");
                deleteCookie('token');
                deleteCookie('user');
                form.resetFields();
                window.location.href = '/';
            }else{
                message.error(response.data.message ?? 'Gagal Mengubah Kata sandi');
            }
            
        } catch (err: any) {
            // console.log(err);
            message.error(err);
        } finally {
            setLoading(false);
            // closeEditable();
        }
    };

    
    return (
        <Form
            name="basic"
            // labelCol={{ span: 10 }}
            // wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            form={form}
            disabled={loading}
        >
            <Form.Item<ChangePasswordForm>
            label="Kata Sandi Lama"
            name="current_password"
            rules={[{ required: true, message: 'Masukan Kata Sandi Lama' }]}
            >
            <Input.Password />
            </Form.Item>

            <Form.Item<ChangePasswordForm>
                label="Kata Sandi Baru"
                name="new_password"
                rules={[{ required: true, message: 'Masukan Kata Sandi baru!' }]}
                >
                <Input.Password />
            </Form.Item>
            <Form.Item<ChangePasswordForm>
                label="Masukan Ulang Kata Sandi Baru"
                name="new_password_confirmation"
                rules={[
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The new password that you entered do not match!'));
                      },
                    }),
                  ]}
                >
                <Input.Password />
            </Form.Item>

           

            <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Simpan
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ChangePassword;