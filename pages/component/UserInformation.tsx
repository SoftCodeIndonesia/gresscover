import { Staff } from "@/type/staff"
import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, GetProp, Input, message, Space,Image, Table, Upload, UploadFile, UploadProps } from "antd";
import Column from "antd/es/table/Column";
import { getCookie, setCookie } from "cookies-next";
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react"
import { User } from "@/type/user";

type UserInformationProp = {
    data: User | null,
}

const layout = {
    labelCol: { span: 2 },
};

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UserInformation: React.FC<UserInformationProp> =  ({data}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [editState, setEdit] = useState<boolean>(false);
    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const token = getCookie('token');

    const router = useRouter();

    const startEditable = () => setEdit(true);
    const closeEditable = () => setEdit(false);

    const toggleEdit = () => editState ? closeEditable() : startEditable();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            
            
            values.id = user?.id;

            var formData = new FormData();

            formData.append('name', values.name);
            formData.append('email', values.email);
            formData.append('phone', values.telephone);

            if(fileList.length > 0){
                formData.append('photo', fileList[0].originFileObj as Blob);
            }

            

            var response = await axiosInstance.post(`/user/${values.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if(response.status == 200){
                setCookie('user', response.data.data);
                message.success("Berhasil Mengubah Data");

                window.location.href = '/account';

            }else{
                message.error("Gagal Mengubah Data");
            }
            
        } catch (err) {
            message.error("Gagal Mengubah Data");
        } finally {
            setLoading(false);
            // closeEditable();
        }
    };

    const details = async () => {
        
        setLoading(true);
      
        try {
            var response = await axiosInstance.get(`/user/${data?.id}`);
            if(response.status == 200){
                setUser(response.data.data);
                form.setFieldsValue({
                    name: response.data.data.user.name,
                    email: response.data.data.user.email,
                    telephone: response.data.user.telephone,
                });
            }
        } catch (error) {
            message.error("Gagal Mendapatkan Informasi Staff");
        } finally {
            setLoading(false);
        }
    }


    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );


    

    useEffect(() => {
        if(data){
            
            setUser(data);
            form.setFieldsValue({
                name: data!.name,
                email: data!.email,
                telephone: data!.telephone,
            });

            

            if(data?.photo != null){
                
                setPreviewImage(`${process.env.NEXT_PUBLIC_BE}/storage/${data.photo}`);
            }
            
        }
    }, [data]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        var data = newFileList[newFileList.length - 1];
        setFileList([data]);
    };
    
    return (
        <Form form={form} {...layout} className="w-full flex flex-col gap-3" onFinish={handleSubmit} layout="horizontal">
            <Form.Item label="Photo Profil">

                <div className="flex">
                    {previewImage && fileList.length == 0 && (
                        <Image
                            wrapperStyle={{ display: 'flex' }}
                            width={100}
                            
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
                    
                    <Upload
                        listType="picture-circle"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}

                    >
                        {fileList.length >= 8 ? null : uploadButton}
                    </Upload>
                    
                </div>

            </Form.Item>
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
                label="No HP"
                name="telephone"
                rules={[{ required: true, message: 'Please input Hire Date!' }]}
            >
                <Input type="number" disabled={!editState} />
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


export default UserInformation;