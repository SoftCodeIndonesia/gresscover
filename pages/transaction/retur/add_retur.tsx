import { useEffect, useState } from "react";
import { ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, Input, message, Select, Table, Modal, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, Radio } from "antd";
import { LayoutType } from "@/type/form.layout";

import { DeleteFilled, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { toFormatLaravel } from "@/utils/date_utils";
import dayjs from "dayjs";
import { Sale, SaleItem } from "@/type/sale";
import { InventoryMovement } from "@/type/inventory_movement";
import { getCookie } from "cookies-next";
import { Retur } from "@/type/retur";


interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_photo: string|null, 
    location_name: string,
    unit_name: string,
    product_id: string|null, 
    stok: number|null, 
    quantity: number|null, 
    price: number|null, 
    id: string|null,
    retur_item_id?: string,
    condition: string,
    parent_index: number,
    sale_item_id?: string,
    inventory_id: string,
    retur_movement_id?: string,
    type: "parent"| "child" | string,
}


const AddRetur: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalPotongan, setModalPotongan] = useState<boolean>(false);
    const [potonganName, setPotonganName] = useState<string>('');
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [data, setData] = useState<Retur>();
    const [slug, setSlug] = useState<string>();
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);

    const [form] = Form.useForm();

    const columns: TableColumnsType<TableInventory> = [
        {
            title: "Item",
            dataIndex: "nama",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => <p>{record.product_name} ({record.location_name})</p>
        },
        {
            title: "Quantity",
            dataIndex: "stok",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <div className="flex items-center gap-3">
                    <Button type="primary" shape="circle" icon={<MinusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) - Number(1);
                        const newData = [...initialTable];
                        if(plus > 0){
                            newData[index].quantity = plus;
                            setInitialTable(newData);
                        }
                    }} />
                    <p>{record.quantity}/{record.stok}</p>
                    <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) + Number(1);
                        if(plus <= record.stok!){
                            const newData = [...initialTable];
                            newData[index].quantity = plus;
                            console.log(newData);
                            setInitialTable(newData);
                        }
                    }} />
                </div>
            ),
        },
        {
            title: "Kondisi Barang",
            dataIndex: "",
            width: 200,
            render: (_: any, record: TableInventory, index: number) => (
                <>
                    <Form.Item name={['items', index, 'condition']} className="m-0">
                        <Radio.Group onChange={(value) => {
                                
                                // const parent: TableInventory = initialTable.filter((value) => value.key == record.key)[0];
                                const newData = [...initialTable];
                                newData[index].condition = value.target.value;
                                setInitialTable(newData);
                                
                            }}>
                                <Radio value="completed"> Baik </Radio>
                                <Radio value="reject"> Buruk </Radio>
                        </Radio.Group>
                    </Form.Item>
                </>
            ),
        },
        {
            title: "Aksi",
            dataIndex: "",
            render: (_: any, record: TableInventory, index: number) => (
                <>
                    <Button onClick={() => removeItem(record)}>
                        <DeleteFilled/>
                    </Button>
                </>
            ),
        },
    ];
    
    const removeItem = (index: TableInventory) => {
        const initial = initialTable.filter((value) => value.key != index.key);
        setInitialTable(initial);
    }

    const fetchSales = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'sales',
                request_column_relation: ["items", "items.movement"],
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
            const initials = sale.items.map((value: SaleItem, index: number) => ({
                key: index, 
                product_name: `${value.product_name}`, 
                product_id: null, 
                stok: value.quantity, 
                checked: false,
                quantity: 1,
                parent_index: -1,
                id: `${index}`,
                sale_item_id: value.sale_item_id,
                product_photo: value.product_photo,
                location_name: value.location_name,
                unit_name: value.unit_name,
                inventory_id: value.inventory_id,
                price: parseInt(value.price),
                type: "parent",
                condition: "completed",
            }));
            setInitialTable(initials)

            form.setFieldValue('items', initials);
        }
    }
    
    const handleSubmit = async () => {
        setLoading(true);
        

        const items :{ quantity: number, retur_movement_id?: string, retur_item_id?: string, inventory_id: string, price: number|null,item_retur_condition: string, sales_item_id?: string, product_name: string, product_photo: string|null, location_name: string, unit_name: string } [] = [];
        initialTable.forEach(element => {
            if(element.quantity! > 0){
                items.push({
                    quantity: element.quantity!,
                    price: element.price,
                    inventory_id: element.inventory_id,
                    sales_item_id: element.sale_item_id,
                    item_retur_condition: element.condition,
                    product_name: element.product_name!,
                    product_photo: element.product_photo,
                    location_name: element.location_name,
                    unit_name: element.unit_name,
                    retur_item_id: element.retur_item_id,
                    retur_movement_id: element.retur_movement_id,
                });
            }
        });

        var total_loss = 0;

        items.forEach(element => {
            console.log(element);
            if(element.item_retur_condition != 'completed'){
                total_loss = total_loss + ((element.price??1) * element.quantity) + ((element.price??1) * element.quantity);
            }else{
                total_loss = total_loss + ((element.price??1) * element.quantity);
            }
        });

        const data = {
            'retur_id': form.getFieldValue('retur_id') ?? null,
            'retur_number': form.getFieldValue('retur_number') ?? null,
            'sales_id': form.getFieldValue('order_id'),
            'sales_number': form.getFieldValue('order_number'),
            'delivery_number': form.getFieldValue('delivery_number'),
            'status': form.getFieldValue('status'),
            'type': form.getFieldValue('type_retur'),
            'delivery_fee': form.getFieldValue('delivery_fee'),
            'retur_item_loss': total_loss,
            'items': items,
        }

        console.log(data);

        try {
            const response = await axiosInstance.post('/retur', data);
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                if(slug){
                    fetchEditData();
                }else{
                    setInitialTable([]);
                    setTotal(0);
                    setSubtotal(0);
                    form.resetFields();
                    form.setFieldsValue({
                        status: 'proses pengembalian',
                        type_retur: 'pengembalian'
                    })
                }
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }

    const fetchEditData = async () => {
        try {
            const retur_id = getCookie('retur_id');
            const request_param: RequestParam = {
                table: 'retur',
                limit: 1,
                page: 1,
                request_column_relation: ['items', 'items.movement','items.inventory', 'items.sale_item'],
                where: [
                    {
                        retur_id: retur_id,
                    }
                ],
                

            }

            const response = await axiosInstance.post('/search', request_param);

            if(response.data.data){
                const responseData: Pagination<Retur> = response.data.data;
                const retur: Retur = responseData.data[0];
                setData(retur);
                form.setFieldValue('retur_id', retur.retur_id);
                form.setFieldValue('retur_number', retur.retur_number);
                form.setFieldValue('order_id', retur.sales_id);
                form.setFieldValue('order_number', retur.sales_number);
                form.setFieldValue('delivery_number', retur.delivery_number);
                form.setFieldValue('status', retur.status);
                form.setFieldValue('type_retur', retur.type);
                form.setFieldValue('delivery_fee', retur.delivery_fee);
                const initials = retur.items.map((value, index) => {
                    return {
                        key: index, 
                        product_name: `${value.product_name}`, 
                        product_id: null, 
                        stok: value.sale_item?.quantity ?? 1, 
                        checked: false,
                        quantity: value.quantity,
                        parent_index: -1,
                        id: `${index}`,
                        sale_item_id: value.sales_item_id,
                        product_photo: value.product_photo,
                        location_name: value.location_name,
                        unit_name: value.unit_name,
                        inventory_id: value.inventory_id,
                        price: value.price,
                        type: "parent",
                        condition: value.item_retur_condition,
                        retur_item_id: value.retur_item_id,
                        retur_movement_id: value.retur_movement_id,
                        // children: [],
                    }
                });
                

                form.setFieldValue('items', initials);
                setInitialTable(initials);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(slug){
            console.log(slug)
            fetchEditData();
        }
    }, [slug])
    

    useEffect(() => {
        const retur_id = getCookie('retur_id');
        
        if(retur_id == undefined){
            form.setFieldsValue({
                status: 'proses pengembalian',
                type_retur: 'pengembalian'
            })
        }else{
            setSlug(retur_id);
        }
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
                                    {label: 'Proses Pengembalian', value: 'proses pengembalian'},
                                    {label: 'Selesai', value: 'selesai'},
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
                        <Button type="link" href="/transaction/retur" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
           
        </DashboardLayout>
    );
}


export default AddRetur;