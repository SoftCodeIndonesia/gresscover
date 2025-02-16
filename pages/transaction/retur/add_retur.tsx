import { useEffect, useState } from "react";
import { ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, Input, message, Select, Table, Modal, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, Radio } from "antd";
import { LayoutType } from "@/type/form.layout";

import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { toFormatLaravel } from "@/utils/date_utils";
import dayjs from "dayjs";
import { Sale } from "@/type/sale";
import { InventoryMovement } from "@/type/inventory_movement";


interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    stok: number|null, 
    quantity: number|null, 
    id: string|null,
    children?: TableInventory[],
    condition: string,
    parent_index: number,
    type: "parent"| "child" | string,
}


const AddRetur: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalPotongan, setModalPotongan] = useState<boolean>(false);
    const [potonganName, setPotonganName] = useState<string>('');
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);

    const [form] = Form.useForm();

    const columns: TableColumnsType<TableInventory> = [
        Table.EXPAND_COLUMN,
        {
            title: "Item",
            dataIndex: "nama",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => <p>{record.product_name}</p>
        },
        {
            title: "Quantity",
            dataIndex: "stok",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <div className="flex items-center gap-3">
                    {record.type == 'parent' && <Button type="primary" shape="circle" icon={<MinusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) - Number(1);
                        const newData = [...initialTable];
                        newData[index].children?.splice(0,1);
                        if(plus > 0){
                            newData[index].quantity = plus;
                            setInitialTable(newData);
                        }
                    }} />}
                    <p>{record.quantity}/{record.stok}</p>
                    {record.type == 'parent' && <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) + Number(1);
                        if(plus <= record.stok!){
                            const newData = [...initialTable];
                            newData[index].quantity = plus;
                            const newChildren = [...newData[index].children ?? [], {
                                key: `${newData[index].children!.length + 1}_${record.id}`, 
                                product_name: `${newData[index].product_name}`, 
                                product_id: null, 
                                stok: 1, 
                                quantity: 1,
                                id: record.id,
                                parent_index: index,
                                condition: 'completed',
                                type: "child",
                            }];
                            newData[index].children = newChildren;
                            console.log(newData);
                            setInitialTable(newData);
                        }
                    }} />}
                </div>
            ),
        },
        {
            title: "Kondisi Barang",
            dataIndex: "",
            width: 200,
            render: (_: any, record: TableInventory, index: number) => (
                <>
                {record.type == 'child' && <Form.Item label="" >
                    <Radio.Group onChange={(value) => {
                        const parentIndex = record.parent_index;
                        // const parent: TableInventory = initialTable.filter((value) => value.key == record.key)[0];
                        const newData = [...initialTable];
                        newData[parentIndex]!.children![index].condition = value.target.value;
                        setInitialTable(newData);
                        
                    }}>
                        <Radio value="completed"> Baik </Radio>
                        <Radio value="reject"> Buruk </Radio>
                    </Radio.Group>
                </Form.Item>}
                </>
            ),
        },
    ];
    
    

    const fetchSales = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'sales',
                request_column_relation: ["items", "items.item", "items.item.parent"],
                search: {
                    column: [
                        "order_number"
                    ],
                    value: query,
                },
                request_column: ["order_number", "sale_id"],
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<Sale> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data?.map((data: Sale) => {
                        return {
                            value: `${data.order_number}`,
                            label: `${data.order_number}`,
                            object: data,
                        }
                    })
                    setOptionsItem(result);
                }
            }else{
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    }

    const selectOrderNumber = (data: any) => {
        if(data.object != undefined){
            const sale: Sale = data.object;
            console.log(sale);
            form.setFieldValue('order_id', sale.sale_id);
            form.setFieldValue('order_number', sale.order_number);

            setInitialTable(sale.items.map((value: InventoryMovement, index: number) => ({
                key: index, 
                product_name: `${value.item.parent_id != null ? value.item.parent?.name + '->' : ''}${value.item.name}`, 
                product_id: null, 
                stok: value.quantity, 
                checked: false,
                quantity: 1,
                parent_index: -1,
                id: value.id,
                condition: 'completed',
                type: "parent",
                children: [
                    {
                        key: `${1}_${value.id}`, 
                        product_name: `${value.item.parent_id != null ? value.item.parent?.name + '->' : ''}${value.item.name}`, 
                        product_id: null, 
                        stok: 1, 
                        quantity: 1,
                        parent_index: index,
                        id: value.id,
                        condition: 'completed',
                        type: "child",
                    }
                ],
            })))
        }
    }

    
    

    const handleSubmit = async () => {
        // setLoading(true);
        

        const items :{ id: string; quantity: number, status: string } [] = [];
        initialTable.forEach(element => {
            if(element.children?.length! > 0){
                element.children!.forEach(child => {
                    items.push({
                        'id': child.id!,
                        'quantity': child.quantity!,
                        'status': child.condition,
                    });
                });
            }
        });

        const data = {
            'sale_id': form.getFieldValue('order_id'),
            'status_retur': form.getFieldValue('status'),
            'delivery_fee': form.getFieldValue('delivery_fee'),
            'delivery_number': form.getFieldValue('delivery_number'),
            'type_retur': form.getFieldValue('type_retur'),
            'items': items,
        }

        console.log(data);

        try {
            const response = await axiosInstance.post('/retur', data);
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                setInitialTable([]);
                setTotal(0);
                setSubtotal(0);
                form.resetFields();
                form.setFieldsValue({
                    status: 'proses pengembalian',
                    type_retur: 'pengembalian'
                })
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }
    

    useEffect(() => {
        form.setFieldsValue({
            status: 'proses pengembalian',
            type_retur: 'pengembalian'
        })
    }, []);

    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-12"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Daftar Retur',
                        href: '/transaction/retur',
                    },
                    {
                        title: `Buat Retur`,
                    }
                ]}
            />
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '100%' }}
                onFinish={handleSubmit}
                disabled={loading}
            >
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1">

                        <Form.Item label="Nomor Pesanan" name="order_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <AutoComplete
                                options={optionItem}
                                filterOption={false}
                                style={{ width: '100%' }}
                                // onChange={(value) => onSelectItem(value, {}, index)}
                                onSelect={(value, option) => selectOrderNumber(option)}
                                onSearch={(value) => fetchSales(value)}
                                placeholder="Cari Nomor Transaksi"
                            />
                        </Form.Item>
                        <Form.Item label="Nomor Pengiriman" name="delivery_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <Input placeholder="Nomor Pengiriman" />
                        </Form.Item>
                        <Form.Item label="Biaya Pengiriman" name="delivery_fee" rules={[{ required: true, message: 'Please input biaya pengiriman!' }]}>
                            <Input placeholder="Biaya Pengiriman" onChange={(e) => {
                                form.setFieldValue('delivery_fee', handlePriceChange(e.target.value ?? '0'))
                            }} />
                        </Form.Item>
                    </div>
                    <div className="flex flex-col flex-1">
                        <Form.Item name="status" label="Status Retur" rules={[{ required: true , message: 'Please input tipe retur!'}]}>
                            <Select
                               
                                placeholder="Status Retur"
                                options={[
                                    {label: 'proses pengembalian', value: 'proses pengembalian'},
                                    {label: 'selesai', value: 'selesai'},
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear
                            >
                            </Select>
                        </Form.Item>

                        <Form.Item name="type_retur" label="Tipe Retur" rules={[{ required: true , message: 'Please input tipe retur!'}]}>
                            <Select
                                options={[
                                    {label: 'Pengembalian', value: 'pengembalian'},
                                    {label: 'Pembatalan pembeli', value: 'pembatalan pembeli'},
                                ]}
                                allowClear
                            >
                            </Select>
                        </Form.Item>

                        
                    </div>
                </div>
                
                <div>
                    <Table 
                            columns={columns} 
                            loading={loading} 
                            rowKey={(record) => record.key ?? ''} 
                            pagination={false} 
                            dataSource={initialTable} 
                            scroll={{ x: 'max-content' }}
                            // expandable={{
                            //     expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
                            // }}
                           
                    />
                    
                </div> 


                <Form.Item className="mt-2">
                        <Button type="link" href="/inventory" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
           
        </DashboardLayout>
    );
}


export default AddRetur;