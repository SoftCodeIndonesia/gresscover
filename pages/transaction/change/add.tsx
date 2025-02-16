import DashboardLayout from "@/pages/component/DashboardLayout";
import { Inventory } from "@/type/inventory";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import { Sale } from "@/type/sale";
import axiosInstance from "@/utils/axiosInstance";
import { handlePriceChange } from "@/utils/validate_price_change";
import { AutoComplete, AutoCompleteProps, Breadcrumb, Button, Form, Input, message, Radio, Select, Table, TableColumnsType } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { InventoryMovement } from "@/type/inventory_movement";
import TextArea from "antd/es/input/TextArea";
import { getCookie } from "cookies-next";
import { ExchangeType } from "@/type/exchange";

interface TableInventory {
    key: React.Key, 
    product_name_from: string|null, 
    product_id_from: string|null, 
    product_name_to: string|null, 
    product_id_to: string|null, 
    stok: number|null, 
    quantity: number|null, 
    available_quantity: number|null, 
    id: string|null,
    status?:string,
    condition: string,
    reference: string,
    unit_id: string,
    unit_name: string,
    reference_id: string,
    inventory_id: string,
    inventory_id_from: string,
    movement_id_from: string|null,
    movement_id_to: string|null,
    note: string,
}

type InventoryMovementSearch = {
    location_id: string;
    inventory_id: string;
    product_name: string;
    product_id: string;
    quantity: number;
    location_name: string;
    movement_id: string;
    movement_quantity: number;
};


const ExchangeAdd: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const columns: TableColumnsType<TableInventory> = [
        {
            title: "Produk yang di tukar",
            dataIndex: "nama",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        value={record.product_name_from}
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onChange={(value) => onSelectItem(value, true, {}, index)}
                        onSelect={(value, option) => onSelectItem(value, true, option, index)}
                        onSearch={(value) => fetchItems(value, record, index)}
                        placeholder="Cari/Pilih Product"
                    />
            )
        },
        {
            title: "Ditukar dengan",
            dataIndex: "nama",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onSelect={(value, option) => onSelectItem(value, false, option, index)}
                        onSearch={(value) => fetchItems(value, record, index)}
                        placeholder="Cari/Pilih Product"
                    />
            )
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
                        if(plus <= record.available_quantity!){
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
                <Form.Item label="" >
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
    ];

    const fetchItems = async (query: string, record?: TableInventory, index?: number) => {
        
        try {
            console.log(query);
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'inventory',
                search: {
                    column: [
                        'product_name',
                    ],
                    value: query,
                },
                where: [
                    {
                        location_id: ['=',`${form.getFieldValue('location_id')}`]
                    }
                ],
                whereHas: {
                    item: {
                        barcode: ['like', `%${query}%`],
                        name: ['like', `%${query}%`]
                    }
                },
                request_column: ["product_id", "location_id", "quantity", "cost", "price", "product_name", "unit_id", "unit_name", 'minimum_stock'],
                request_column_relation: ["item", "location"]
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                if(response.data.data.data.length > 0){
                    const resultResponse: Inventory[] = response.data.data.data;
                    const result = resultResponse.map((data: Inventory) => {
                        return {
                            value: `${data?.product_name}`,
                            label: `${data?.product_name}`,
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

    const onSelectItem = async (value: string, is_from: boolean, option: any, index: number,item?: TableInventory) => {
       
        if(option.object == undefined){
            const newData = [...initialTable];
            const selected: InventoryMovementSearch = option.object;
            if(is_from){
                newData[index].product_name_from = selected.product_name;
                newData[index].product_id_from = selected.product_id;
                newData[index].inventory_id_from = selected.inventory_id;
            }else{
                newData[index].product_name_to = selected.product_name;
                newData[index].product_id_to = selected.product_id;
                newData[index].inventory_id = selected.inventory_id;
                
            }
            newData[index].reference = 'exchange';

            setInitialTable(newData);

        }
    };

    const get_sales_item = async () => {

    }



    const selectOrderNumber = (data: any) => {
        if(data.object != undefined){
            const sale: Sale = data.object;
            console.log(sale);
            form.setFieldValue('sales_id', sale.sale_id);
            form.setFieldValue('order_number', sale.order_number);

            setInitialTable(sale.items.map((value: InventoryMovement, index: number) => {
                return {
                    key: index, 
                    product_name_from: value.inventory.product_name ?? '', 
                    product_id_from: value.inventory.product_id ?? '', 
                    product_name_to: '', 
                    product_id_to: '', 
                    stok: value.inventory.quantity, 
                    quantity: 0, 
                    available_quantity: value.inventory.quantity, 
                    id: null,
                    status: form.getFieldValue('status'),
                    condition: 'completed',
                    reference: 'exchange',
                    reference_id: '',
                    inventory_id: value.inventory_id ?? '',
                    unit_id: value.inventory.unit_id ?? '',
                    unit_name: value.inventory.unit_name ?? '',
                    inventory_id_from: value.inventory.inventory_id,
                    note: '',
                    movement_id_from: null,
                    movement_id_to: null,
                }
            }))
        }
    }

    const fetchSales = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'sales',
                request_column_relation: ["items", "items.inventory", "items.item.parent"],
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

    const handleSubmit = async () => {
        if(initialTable.length == 0){
            return message.error('Tambahkan item yang akan di tukar terlebih dahulu');
        }

        const items: {
            "quantity": number,
            "inventory_id": string,
            "inventory_id_from": string,
            "unit_id": string,
            "unit_name": string,
            "note": string,
            "status": string,
            "condition": string
        }[] = initialTable.map((value: TableInventory) => {
            const dataItems: {
                quantity: number,
                inventory_id: string,
                inventory_id_from: string,
                unit_id: string,
                unit_name: string,
                note: string,
                status: string,
                condition: string,
                movement_id_from?: string,
                movement_id_to?: string,
            } = {
                "quantity": value.quantity ?? 0,
                "inventory_id": value.inventory_id,
                "inventory_id_from": value.inventory_id_from,
                "unit_id": value.unit_id,
                "unit_name": value.unit_name,
                "note": value.note,
                "status": form.getFieldValue('status'),
                "condition": value.condition,
            };

            if(value.movement_id_from != null){
                dataItems.movement_id_from = value.movement_id_from;
            }
            if(value.movement_id_to != null){
                dataItems.movement_id_to = value.movement_id_to;
            }
            return dataItems;
        });

        const data = {
            "sales_id": form.getFieldValue('sales_id'),
            "sales_number": form.getFieldValue('order_number'),
            "status": form.getFieldValue('status'),
            "delivery_fee": form.getFieldValue('delivery_fee'),
            "delivery_number": form.getFieldValue('delivery_number'),
            "note": form.getFieldValue('note'),
            "items":items,
        }

        console.log(data);

        // setLoading(true);

        // try {
        //     const response = await axiosInstance.post('/exchange', data);
        //     if(response.status == 200){
        //         message.success('Berhasil!');
        //         form.resetFields();
        //         setInitialTable([]);
        //     }
        // } catch (error: any) {
        //     message.error(`${error?.response?.data?.message ?? error}`);
        // } finally {
        //     setLoading(false);
        // }
    }

    

    useEffect(()=> {
        const cookie = getCookie('exchange');
        if(cookie == undefined){
            // setInitialTableData();
        }else{
            const exchange: ExchangeType = JSON.parse(cookie);
            console.log(exchange);
            form.setFieldValue('sales_id', exchange.sales_id);
            form.setFieldValue('order_number', exchange.sales_number);
            form.setFieldValue('status', exchange.status);
            form.setFieldValue('delivery_fee', exchange.delivery_fee);
            form.setFieldValue('delivery_number', exchange.delivery_number);
            form.setFieldValue('note', exchange.note);
            // getUpdateData();

            const count = exchange.items.length % 2;

            setInitialTable(exchange.sales!.items.map((value, index) => {
                return {
                    key: index, 
                    product_name_from: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].product_name ?? '', 
                    product_id_from: value.inventory.product_id ?? '', 
                    product_name_to: '', 
                    product_id_to: '', 
                    stok: value.inventory.quantity, 
                    quantity: 0, 
                    available_quantity: value.inventory.quantity, 
                    id: value.id,
                    status: form.getFieldValue('status'),
                    condition: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].status,
                    reference: 'exchange',
                    reference_id: '',
                    inventory_id: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].inventory_id ?? '',
                    unit_id: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].unit_id ?? '',
                    unit_name: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].unit_name ?? '',
                    inventory_id_from: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].inventory_id,
                    note: '',
                    movement_id_from: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'in') )[0].id ?? null,
                    movement_id_to: exchange.items.filter((item) => (item.inventory_id == value.inventory_id && item.type == 'out') )[0].product_name ?? null,
                }
            }));
        }
    }, [])
    useEffect(()=> {
        form.setFieldsValue({
            'status': 'deliver_to_seller',
        });
    })

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
                        title: 'Daftar Penukaran Barang',
                        href: '/transaction/change',
                    },
                    {
                        title: `Tambah Penukaran Barang`,
                    }
                ]}
            />
            <Form
                layout={"vertical"}
                form={form}
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
                        <Form.Item name="status" label="Status Penukaran" rules={[{ required: true , message: 'Please Status Penukaran!'}]}>
                            <Select
                               
                                placeholder="Status Penukaran"
                                options={[
                                    {label: 'Dikirim ke penjual', value: 'deliver_to_seller'},
                                    {label: 'Dikirim ke pembeli', value: 'deliver_to_buyer'},
                                    {label: 'selesai', value: 'completed'},
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear
                            >
                            </Select>
                        </Form.Item>
                        <Form.Item label="Catatan" name="note">
                            <TextArea rows={4} />
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
                        <Button type="link" href="/change" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
           
        </DashboardLayout>
    );
}

export default ExchangeAdd;