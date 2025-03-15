import { Permission } from "@/type/permission";
import axiosInstance from "@/utils/axiosInstance";
import { Button, Checkbox, Input, message, Space, Table, Tree, TreeDataNode } from "antd";
import React, { useEffect, useState } from "react";
import {
    ReloadOutlined,
    SearchOutlined,
  } from '@ant-design/icons';
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useRouter } from "next/router";
import { title } from "process";
import { MenuSide } from "@/type/menu";

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
    const [menu_item, setMenuItem] = useState<MenuSide>([]);
    const [treeData, setTraaData] = useState<TreeDataNode[]>([]);
    const [defaultCheckedKeys, setDefaultCheckedKey] = useState<string[]>([]);

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

    

    const getMenus = async () => {
        isLoading(true);
        try {
          const response = await axiosInstance.get('/menus');
          if(response.status == 200){
            const menus: MenuSide = response.data.data.data;
            const user_permission: number[] = response.data.data.user_permissions;
            const tree = menus.map((value) => {
                return {
                    title: value.name,
                    key: value.key,
                    children: [...Object.entries(value.permissions).map(([key, value]) => ({
                        key: key,
                        title: value,
                        
                    })), ...value.children.map((child) => {
                        return {
                            title: child.name,
                            key: child.key,
                            children: Object.entries(child.permissions).map(([key, value]) => ({
                                key: key,
                                title: value
                            }))
                        }
                    }), ],
                }
            });
            console.log(tree);
            console.log(user_permission.map((value) => (value.toString())));
            setTraaData(tree);
            setDefaultCheckedKey(user_permission.map((value) => (value.toString())));
            setMenuItem(menus);
          }
        } catch (error: any) {
          message.error(`${error?.response?.data?.message ?? error}`);
        } finally {
            isLoading(false);
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as string);
            getMenus();
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        givePermission([...permissions.map((data) => data.name)]);
    },[])



    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                {/* <Input prefix={<SearchOutlined />} placeholder="Cari Hak Akses" onChange={(e) => handleSearch(e.target.value)}/> */}
                <Button type="primary" htmlType="button" onClick={getMenus} loading={loading} icon={<ReloadOutlined />}>Reload</Button>
                <Button className="bg-green-600 hover:bg-green-500 active:bg-green-500 focus:bg-green-500 text-white" htmlType="button" disabled={tmp_permission.length == 0} onClick={submitPermission} loading={loading}>Simpan</Button>
            </Space>
            {/* <Table columns={columns} loading={loading} dataSource={filteredData} rowKey={(record) => record.id.toString()} /> */}
            <Tree
                checkable
                // defaultExpandedKeys={['0-0-0', '0-0-1']}
                defaultSelectedKeys={defaultCheckedKeys}
                defaultCheckedKeys={defaultCheckedKeys}
                // onSelect={onSelect}
                // onCheck={onCheck}
                treeData={treeData}
            />
        </div>
    )
}

export default HakAkses;