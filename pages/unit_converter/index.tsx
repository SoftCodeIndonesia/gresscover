import { ItemUnit } from "@/type/item";
import axiosInstance from "@/utils/axiosInstance";
import { getUnitType } from "@/utils/get_filters";
import { Breadcrumb, Button, Form, GetRef, Input, InputRef, message, Modal, Popconfirm, Space, Table, TableProps } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import {
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { TableRowSelection } from "antd/es/table/interface";
interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof ItemUnit;
    record: ItemUnit;
    handleSave: (record: ItemUnit) => void;
}


type ColumnTypes = Exclude<TableProps<ItemUnit>['columns'], undefined>;


const UnitConverter: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dataSource, setDataSource] = useState<ItemUnit[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalForm, setModalForm] = useState<boolean>(false);
    const [searchValue, setSearchText] = useState<string>('');
    interface EditableRowProps {
        index: number;
    }

    const [formNew] = Form.useForm();

    type FormInstance<T> = GetRef<typeof Form<T>>;

    const EditableContext = React.createContext<FormInstance<any> | null>(null);

    const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
            </Form>
        );
    };

    const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
      }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef<InputRef>(null);
        const form = useContext(EditableContext)!;
      
        useEffect(() => {
          if (editing) {
            inputRef.current?.focus();
          }
        }, [editing]);
      
        const toggleEdit = () => {
          setEditing(!editing);
          form.setFieldsValue({ [dataIndex]: record[dataIndex] });
        };
      
        const save = async () => {
          try {
            const values = await form.validateFields();
      
            toggleEdit();
            handleSave({ ...record, ...values });
          } catch (errInfo) {
            console.log('Save failed:', errInfo);
          }
        };
      
        let childNode = children;
      
        if (editable) {
          childNode = editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
              rules={[{ required: true, message: `${title} is required.` }]}
            >
              <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
          ) : (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingInlineEnd: 24 }}
              onClick={toggleEdit}
            >
              {children}
            </div>
          );
        }
      
        return <td {...restProps}>{childNode}</td>;
    };

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: 'Nama Satuan',
            dataIndex: 'name',
            render: (_:any, record: ItemUnit, index: number) => <p>{`1 ${record.name}`}</p>
        },
        {
            title: 'Nilai Satuan',
            dataIndex: 'max_value',
            width: '30%',
            editable: true,
            sorter: (a, b) => (a.max_value ?? 1) - (b.max_value ?? 1),
        },
        {
            title: 'Aksi',
            dataIndex: 'max_value',
            width: '5%',
            render: (text: any, record: ItemUnit) => (
                <div className='flex gap-3 items-center'>
                    <Button type='link' className="text-yellow-500" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm title="Hapus Satuan" cancelText="Batal" onConfirm={() => handleDelete([record.type_id])} okText="Hapus" description={`Anda Yakin Ingin Menghapus Satuan Ini?`}>

                        <Button type='link' danger>Hapus</Button>

                    </Popconfirm>
                </div>
            ),
        },
    ];

    const handleEdit = (data: ItemUnit) => {
        formNew.setFieldsValue({
            type_id: data.type_id,
            name: data.name,
            max_value: data.max_value,
            slug: data.slug,
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
            const response = await axiosInstance.post(`/search_del`, {"table": 'unit', "data": ids});
            if(response.status == 200){
                message.success('Unit Telah Dihapus!');
                fetchUnit();
                setSelectedRowKeys([]);
            }else{
                message.error('Data Unit Telah Dihapus!');
            }
        } catch (error) {
            message.error('Gagal Hapus Unit!');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmitEdit = async (row: ItemUnit) => {
        const where = {type_id: row.type_id};
        const data = {name: row.name, max_value: row.max_value};
        setLoading(true);
        try {
            const response = await axiosInstance.post('/search_update', {table: 'unit', where: where, data: data});
            if(response.status == 200){
                formNew.resetFields();
                setModalForm(false);
                fetchUnit();
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = (row: ItemUnit) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.type_id === item.type_id);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        handleSubmitEdit(row);
        setDataSource(newData);
      };
    
      const components = {
        body: {
          row: EditableRow,
          cell: EditableCell,
        },
      };

    const filteredData = dataSource.filter((data) =>
        data.name.toLowerCase().includes(searchValue) ||
        data.max_value?.toString().includes(searchValue)
    );  
    
    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: (record: ItemUnit) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        };
    });

    const handleSubmit = async () => {
        const values = formNew.getFieldsValue();
        console.log(values);
        if(values.type_id != null){
            handleSubmitEdit({max_value: values.max_value, name: values.name, slug: values.slug, type_id: values.type_id});
        }else{
            setLoading(true);
            try {
                const response = await axiosInstance.post('/search_store', {table: 'unit', data: values});
                if(response.status == 200){
                    formNew.resetFields();
                    setModalForm(false);
                    fetchUnit();
                }
            } catch (error: any) {
                message.error(`${error.response?.data?.message ?? error}`);
            } finally {
                setLoading(false);
            }
        }
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ItemUnit> = {
            selectedRowKeys,
            onChange: onSelectChange,
    };

    const handleSearch = (value: string) => {
        setSearchText(value.toLowerCase());
    };

    const fetchUnit = async () => {
        setLoading(true);
        const response = await getUnitType();
        setDataSource(response as unknown as ItemUnit[]);
        setLoading(false);
    }

    useEffect(() => {
        fetchUnit();
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
                        title: 'Konversi Satuan',  
                    },
                ]}
            />
            <Space style={{ marginBottom: 16 }} className="items-center w-full">
                <Input prefix={<SearchOutlined />} placeholder="Cari Data Satuan" className="w-full" onChange={(e) => handleSearch(e.target.value)}/>
                <Button type="primary" onClick={() => {
                    formNew.resetFields();
                    setModalForm(true);
                }}>
                    Buat Satuan Baru
                </Button>
                <Button type="primary" onClick={fetchUnit} icon={<ReloadOutlined/>}>
                    Reload
                </Button>
                {selectedRowKeys.length > 0 && <Popconfirm
                    title="Yakin Ingin Menghapus Data Satuan?"
                    description="Data yang sudah dihapus tidak akan bisa di kembalikan!"
                    onConfirm={() => handleDelete(selectedRowKeys as string[])}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>}
            </Space>
            <Table<ItemUnit>
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={filteredData}
                rowKey={(record) => record.type_id}
                columns={columns as ColumnTypes}
                loading={loading}
                rowSelection={rowSelection}
            />
            <Modal title="Form Satuan" confirmLoading={loading} open={modalForm} onOk={handleSubmit} onCancel={() => {
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
                    <Form.Item label="Nama Satuan" name="name" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Nama Satuan" />
                    </Form.Item>
                    <Form.Item label="Nama Satuan" name="slug" hidden >
                        <Input placeholder="Masukan Nama Satuan" value={formNew.getFieldValue('slug')} />
                    </Form.Item>
                    <Form.Item label="Nama Satuan" name="type_id" hidden>
                        <Input placeholder="Masukan Nama Satuan" value={formNew.getFieldValue('type_id')} />
                    </Form.Item>
                    <Form.Item label="Nilai Satuan Terkecil" name="max_value" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Nilai Satuan Terkecil" />
                    </Form.Item>
                </Form>
            </Modal>
        </DashboardLayout>
    );
}

export default UnitConverter;