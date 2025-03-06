
import axiosInstance from "@/utils/axiosInstance";
import { getTax, getUnitType } from "@/utils/get_filters";
import { Breadcrumb, Button, Form, GetRef, Input, InputNumber, InputRef, message, Modal, Popconfirm, Select, Space, Table, TableProps, Typography } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { Tax } from "@/type/tax";
import { validateDecimal } from "@/utils/validate_decimal";
import { TableRowSelection } from "antd/es/table/interface";



type ColumnTypes = Exclude<TableProps<Tax>['columns'], undefined>;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'number' | 'text' | 'option';
    record: Tax;
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
    defaultValue={record.unit_value}
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


const TaxList: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<Tax[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalForm, setModalForm] = useState<boolean>(false);
    const [searchValue, setSearchText] = useState<string>('');
    interface EditableRowProps {
        index: number;
    }

    const [form] = Form.useForm();
    const [formNew] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record: Tax) => record.tax_id === editingKey;

    const edit = (record: Partial<Tax>) => {
        form.setFieldsValue({...record });
        setEditingKey(record.tax_id!);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const defaultColumns = [
        {
            title: 'Nama Potongan',
            dataIndex: 'name',
            editable: true,
            render: (_:any, record: Tax, index: number) => <p>{record.name}</p>
        },
        {
            title: 'Default Potongan',
            dataIndex: 'value',
            // width: '10%',
            editable: true,
            sorter: (a: Tax, b: Tax) => (a.value ?? 1) - (b.value ?? 1),
        },
        {
            title: 'Satuan Potongan',
            dataIndex: 'unit_value',
            // width: '10%',
            editable: true,
        },
        {
            title: 'Maximum',
            dataIndex: 'max_value',
            // width: '10%',
            editable: true,
            sorter: (a: Tax, b: Tax) => (a.max_value ?? 1) - (b.max_value ?? 1),
        },
        {
            title: 'Aksi',
            dataIndex: '',
            width: '5%',
            render: (text: any, record: Tax) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                      <Typography.Link onClick={() => save(record.tax_id!)} style={{ marginInlineEnd: 8 }}>
                        Save
                      </Typography.Link>
                      <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                        <a>Cancel</a>
                      </Popconfirm>
                    </span>
                  ) :
                <div className='flex gap-3 items-center'>
                    <Button type='link' className="text-yellow-500" disabled={editingKey !== ''} onClick={() => edit(record)}>Edit</Button>
                    <Popconfirm title="Hapus Data Potongan" cancelText="Batal" onConfirm={() => handleDelete([record.tax_id!])} okText="Hapus" description={`Anda Yakin Ingin Menghapus Data Ini?`}>

                        <Button type='link' danger>Hapus</Button>

                    </Popconfirm>
                </div>
            },
        },
    ];

    const handleSubmitEdit = async (row: Tax) => {
        const where = {tax_id: row.tax_id};
        const data = {name: row.name, value: row.value, unit_value: row.unit_value, max_value: row.max_value};
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_update', {table: 'tax', where: where, data: data});
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
          const row = (await form.validateFields()) as Tax;
            
          const newData = [...dataSource];
          const index = newData.findIndex((item) => key === item.tax_id);
          if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
              ...item,
              ...row,
            });

            const newTax: Tax = {...row, tax_id: key.toString()};
            handleSubmitEdit(newTax);
            localStorage.setItem("taxs", JSON.stringify(newData))
            setDataSource(newData);
            setEditingKey('');
          } else {
            newData.push(row);
            setDataSource(newData);
            setEditingKey('');
          }
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
        }
    };

    const mergedColumns: TableProps<Tax>['columns'] = defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record: Tax) => ({
            record,
            inputType: col.dataIndex === 'name' ? 'text' : col.dataIndex == 'unit_value' ? 'option' : 'number',
            dataIndex: col.dataIndex,
            title: col.title,
            editing: isEditing(record),
          }),
        };
    });

    const handleEdit = (data: Tax) => {
        formNew.setFieldsValue({
            tax_id: data.tax_id,
            name: data.name,
            max_value: data.max_value,
            value: data.value,
            unit_value: data.unit_value,
        });

        setModalForm(true);
    }

    const handleDelete = async (ids: string[]) => {
        if(ids.length <= 0){
            message.error('Pilih Data Untuk di Hapus!');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post(`/search_del`, {"table": 'tax', "data": ids});
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
        data.name.toLowerCase().includes(searchValue) ||
        data.max_value?.toString().includes(searchValue) ||
        data.value?.toString().includes(searchValue) ||
        data.unit_value?.toString().includes(searchValue)
    );  
    
    

    const handleSubmit = async () => {
        const values = formNew.getFieldsValue();
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_store', {table: 'tax', data: {
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

    const rowSelection: TableRowSelection<Tax> = {
            selectedRowKeys,
            onChange: onSelectChange,
    };

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const fetchTax = async () => {
        setLoading(true);
        const response = await getTax();
        localStorage.setItem("taxs", JSON.stringify(response))
        setDataSource(response as unknown as Tax[]);
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
                        title: 'Daftar Potongan',  
                    },
                ]}
            />
            <Space style={{ marginBottom: 16 }} className="items-center w-full">
                <Input prefix={<SearchOutlined />} placeholder="Cari Data Potongan" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                <Button type="primary" onClick={() => {
                    formNew.setFieldsValue({
                        value: 0,
                        unit_value: 'percent',
                        max_value: 0,
                    });
                    setModalForm(true);
                }}>
                    Buat Jenis Potongan Baru
                </Button>
                <Button type="primary" onClick={fetchTax} icon={<ReloadOutlined/>}>
                    Reload
                </Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Potongan?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Form form={form} component={false}>

            <Table<Tax>
               components={{
                    body: { cell: EditableCell  },
                }}
                bordered
                dataSource={filteredData}
                columns={mergedColumns}
                rowClassName="editable-row"
                rowKey={(record) => record.tax_id!}
                pagination={{ onChange: cancel }}
                loading={loading}
                rowSelection={rowSelection}
            />

            </Form>
            <Modal title="Form Potongan" confirmLoading={loading} open={modalForm} onOk={handleSubmit} onCancel={() => {
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
                    <Form.Item label="Nama Potongan" name="name" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Nama Satuan" />
                    </Form.Item>
                    <Form.Item label="Satuan" name="unit_value" >
                        <Select
                            defaultValue={'percent'}
                            style={{ width: 120 }}
                            options={[
                            { value: 'percent', label: 'Persentase' },
                            { value: 'nominal', label: 'Nominal' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Nilai Default Potongan" name="value" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Nilai Default Potongan" onChange={(e) => {
                            formNew.setFieldValue('value', validateDecimal(e.target.value));
                        }} />
                    </Form.Item>
                    <Form.Item label="Maximum Potongan" name="max_value" >
                        <Input placeholder="Masukan Maximum Potongan" onChange={(e) => {
                            formNew.setFieldValue('max_value', validateDecimal(e.target.value));
                        }} />
                    </Form.Item>
                    <Form.Item name="tax_id" hidden>
                        <Input value={formNew.getFieldValue('tax_id')} />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
}

export default TaxList;