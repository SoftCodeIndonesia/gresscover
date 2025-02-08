import { Permission } from "@/type/permission";
import axiosInstance from "@/utils/axiosInstance";
import { Button, Checkbox, Input, message, Space, Table } from "antd";
import React, { useEffect, useState } from "react";
import {
    ReloadOutlined,
    SearchOutlined,
  } from '@ant-design/icons';
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useRouter } from "next/router";
import { title } from "process";

type HakAksesProps = {
    id: number,
    permissions: Permission[],
}

const HakAkses: React.FC<HakAksesProps> = ({id, permissions}) => {
    const [data_permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, isLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState('');
    const [tmp_permission, givePermission] = useState<string[]>([]);
    const [slug, setSlug] = useState<string | undefined>(undefined);
    

    const router = useRouter();

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const filteredData = data_permissions.filter((staff) =>
        staff.name.toLowerCase().includes(searchText) ||
        staff.name.toLowerCase().includes(searchText)
    );

    const columns = [
        
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            render: (_: unknown, record: unknown, index: number) => index + 1,
        },
        {
            title: 'Hak Akses',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Aksi',
            dataIndex: '',
            key: '',
            render: (_: unknown, record: Permission) => <Checkbox value={record.name} checked={tmp_permission.includes(record.name)} onChange={changeCheckbox}/>
        },
    ]


    


    const changeCheckbox = (e: CheckboxChangeEvent) => {
        givePermission((prev) =>
            prev.includes(e.target.value)
              ? prev.filter((p) => p !== e.target.value)
              : [...prev, e.target.value]
          );
    }

    const submitPermission = async () => {
        isLoading(true);
        try {
            const response = await axiosInstance.post(`permission/${id}/give-permissions`, {'permissions': tmp_permission});
            
            if(response.status == 200){
                message.success('Berhasil Memperbarui Hak Akses!');
            }else{
                message.error('Gagal Memperbarui Hak Akses!');
            }

        } catch (error) {
            message.error('Gagal Memperbarui Hak Akses!');
        }finally {
            isLoading(false);
        }
    }


    const fetchPermissions = async () => {
        isLoading(true);
        try {
            const response = await axiosInstance.get('/permission');
            if(response.status == 200){
                setPermissions(response.data.data);
            }else{
                message.error("Gagal Mengambil Data Permission");
            }
        } catch (error) {
            message.error("Gagal Mengambil Data Permission");
        }finally {
            isLoading(false);
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        fetchPermissions();
        console.log(permissions);
        givePermission([...permissions.map((data) => data.name)]);
    },[])

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Input prefix={<SearchOutlined />} placeholder="Cari Hak Akses" onChange={(e) => handleSearch(e.target.value)}/>
                <Button type="primary" htmlType="button" onClick={fetchPermissions} loading={loading} icon={<ReloadOutlined />}>Reload</Button>
                <Button className="bg-green-600 hover:bg-green-500 active:bg-green-500 focus:bg-green-500 text-white" htmlType="button" disabled={tmp_permission.length == 0} onClick={submitPermission} loading={loading}>Simpan</Button>
            </Space>
            <Table columns={columns} loading={loading} dataSource={filteredData} rowKey={(record) => record.id.toString()} />
        </div>
    )
}

export default HakAkses;