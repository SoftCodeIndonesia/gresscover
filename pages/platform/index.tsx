
import axiosInstance from "@/utils/axiosInstance";
import { getPlatforms, getTax, getUnitType } from "@/utils/get_filters";
import { Breadcrumb, Button, Form, GetRef, Input, InputNumber, InputRef, message, Modal, Popconfirm, Select, Space, Table, TableProps, Typography } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';

import { validateDecimal } from "@/utils/validate_decimal";
import { TableRowSelection } from "antd/es/table/interface";
import { Platform } from "@/type/platform";



type ColumnTypes = Exclude<TableProps<Platform>['columns'], undefined>;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text' | 'option';
    record: Platform;
    index: number;
  }
  
  const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : inputType === 'option' ? <Select
    defaultValue={record.id}
    style={{ width: 120 }}
    options={[
      { value: 'percent', label: 'Persentase' },
      { value: 'nominal', label: 'Nominal' },
    ]}
  /> :  <Input />;
    
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };


const ListPlatformPenjualan: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<Platform[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalForm, setModalForm] = useState<boolean>(false);
    const [searchValue, setSearchText] = useState<string>('');
    interface EditableRowProps {
        index: number;
    }

    const [form] = Form.useForm();
    const [formNew] = Form.useForm();
    const [editingKey, setEditingKey] = useState<number>(0);

    const isEditing = (record: Platform) => record.id === editingKey;

    const edit = (record: Partial<Platform>) => {
        form.setFieldsValue({...record });
        setEditingKey(record.id!);
    };

    const cancel = () => {
        setEditingKey(0);
    };

    const defaultColumns = [
        {
            title: 'Nama',
            dataIndex: 'name',
            editable: true,
            render: (_:any, record: Platform, index: number) => <p>{record.name}</p>
        },
        {
            title: 'Aksi',
            dataIndex: '',
            width: '5%',
            render: (text: any, record: Platform) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                      <Typography.Link onClick={() => save(record.id!)} style={{ marginInlineEnd: 8 }}>
                        Save
                      </Typography.Link>
                      <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                        <a>Cancel</a>
                      </Popconfirm>
                    </span>
                  ) :
                <div className='flex gap-3 items-center'>
                    <Button type='link' className="text-yellow-500" disabled={editingKey !== 0} onClick={() => edit(record)}>Edit</Button>
                    <Popconfirm title="Hapus Data Platform" cancelText="Batal" onConfirm={() => handleDelete([record.id!])} okText="Hapus" description={`Anda Yakin Ingin Menghapus Data Ini?`}>

                        <Button type='link' danger>Hapus</Button>

                    </Popconfirm>
                </div>
            },
        },
    ];

    const handleSubmitEdit = async (row: Platform) => {
        const where = {id: row.id};
        const data = {name: row.name};
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_update', {table: 'platform', where: where, data: data});
            if(response.status == 200){
                formNew.resetFields();
                setModalForm(false);
                
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const save = async (key: React.Key) => {
        try {
          const row = (await form.validateFields()) as Platform;
            
          const newData = [...dataSource];
          const index = newData.findIndex((item) => key === item.id);
          if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
              ...item,
              ...row,
            });

            const newTax: Platform = {...row, id: parseInt(key.toString())};
            handleSubmitEdit(newTax);
            localStorage.setItem("taxs", JSON.stringify(newData))
            setDataSource(newData);
            setEditingKey(0);
          } else {
            newData.push(row);
            setDataSource(newData);
            setEditingKey(0);
          }
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
        }
    };

    const mergedColumns: TableProps<Platform>['columns'] = defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record: Platform) => ({
            record,
            inputType: col.dataIndex === 'name' ? 'text' : col.dataIndex == 'unit_value' ? 'option' : 'number',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        };
    });
    

    const handleDelete = async (ids: number[]) => {
        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/search_del`, {"table": 'platform', "data": ids});
            if(response.status == 200){
                message.success('Data Telah Dihapus!');
                fetchTax();
                setSelectedRowKeys([]);
            }else{
                message.error('Data Gagal Dihapus!');
            }
        } catch (error) {
            message.error('Gagal Hapus Data!');
        } finally {
            setLoading(false);
        }
    }

      

    const filteredData = dataSource.filter((data) =>
        data.name.toLowerCase().includes(searchValue)
    );  
    
    

    const handleSubmit = async () => {
        const values = formNew.getFieldsValue();
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_store', {table: 'platform', data: {
                name: values.name,
                value: values.value,
                max_value: values.max_value,
                unit_value: values.unit_value,
            }});
            if(response.status == 200){
                formNew.resetFields();
                setModalForm(false);
                fetchTax();
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
            
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<Platform> = {
            selectedRowKeys,
            onChange: onSelectChange,
    };

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const fetchTax = async () => {
        setLoading(true);
        const response = await getPlatforms();
        
        setDataSource(response as unknown as Platform[]);
        setLoading(false);
    }

    useEffect(() => {
        fetchTax();
    }, []);
    
    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-4"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Daftar Platform',  
                    },
                ]}
            />
            <Space style={{ marginBottom: 16 }} className="items-center w-full">
                <Input prefix={<SearchOutlined />} placeholder="Cari Data Platform" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                <Button type="primary" onClick={() => {
                    formNew.resetFields();
                    setModalForm(true);
                }}>
                    Buat Jenis Platform Baru
                </Button>
                <Button type="primary" onClick={fetchTax} icon={<ReloadOutlined/>}>
                    Reload
                </Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Platform?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as number[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Form form={form} component={false}>

            <Table<Platform>
               components={{
                    body: { cell: EditableCell  },
                }}
                bordered
                dataSource={filteredData}
                columns={mergedColumns}
                rowClassName="editable-row"
                rowKey={(record) => record.id!.toString()}
                pagination={{ onChange: cancel }}
                loading={loading}
                rowSelection={rowSelection}
            />

            </Form>
            <Modal title="Form Platform Penjualan" confirmLoading={loading} open={modalForm} onOk={handleSubmit} onCancel={() => {
                formNew.resetFields();
                setModalForm(false);
            }}>
                <Form
                    layout={'vertical'}
                    form={formNew}
                    style={{ maxWidth: '100%' }}
                    className="flex flex-col"
                    onFinish={handleSubmit}
                    disabled={loading}
                >
                    <Form.Item label="Nama Platform" name="name" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Nama Platform" />
                    </Form.Item>
                    
                </Form>
            </Modal>
        </DashboardLayout>
    );
}

export default ListPlatformPenjualan;