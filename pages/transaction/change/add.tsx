import DashboardLayout from "@/pages/component/DashboardLayout";
import { Inventory } from "@/type/inventory";
import { Pagination } from "@/type/pagination";
import { RequestParam } from "@/type/request_param";
import { Sale, SaleItem } from "@/type/sale";
import axiosInstance from "@/utils/axiosInstance";
import { handlePriceChange } from "@/utils/validate_price_change";
import { AutoComplete, AutoCompleteProps, Breadcrumb, Button, Form, Input, message, Radio, Select, Table, TableColumnsType } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined, SwapOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { InventoryMovement } from "@/type/inventory_movement";
import TextArea from "antd/es/input/TextArea";
import { getCookie } from "cookies-next";
import { ExchangeItem, ExchangeType } from "@/type/exchange";

interface TableInventory {
    key: React.Key, 
    product_name: string|null,
    product_photo: string|null,
    location_name: string|null,
    product_name_to: string|null,
    product_photo_to: string|null,
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
    change_movement_id: string|null,
    inventory_id_exchange: string|null,
    note: string,
    exchange_item_id?:string,
    exchange_id?: string,
    sale_item_id?: string,
    movement_in?: string,
    price: number,
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
    const [data, setData] = useState<ExchangeType>();
    const [slug, setSlug] = useState<string>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);


    const columns: TableColumnsType<TableInventory> = [
        {
            title: "Produk yang di tukar",
            dataIndex: "nama",
            fixed: 'left',
            // width: 200,
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'product_name']} rules={[{ required: true, message: 'Bidang ini tidak boleh kosong!' }]}>
                    <AutoComplete
                        
                            options={optionItem}
                            filterOption={false}
                            // style={{ width: 200 }}
                            onChange={(value) => onSelectItem(value, true, {}, index)}
                            onSelect={(value, option) => onSelectItem(value, true, option, index)}
                            onSearch={(value) => fetchItems(value, record, index)}
                            placeholder="Cari/Pilih Product"
                    />
                </Form.Item>
            )
        },
        {
            title: "",
            dataIndex: "",
            align: "center",
            width: 50,
            render: (_: any, record: TableInventory, index: number) => (
                <Button icon={<SwapOutlined />} onClick={() => {
                    const newData = [...initialTable];
                    newData[index].inventory_id_exchange = newData[index].inventory_id_from;
                    newData[index].product_name_to = newData[index].product_name;
                    setInitialTable(newData);
                    form.setFieldValue('items', newData);
                }} ></Button>
            )
        },
        {
            title: "Ditukar dengan",
            dataIndex: "nama",
            fixed: 'left',
            // width: 200,
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'product_name_to']} rules={[{ required: true, message: 'Bidang ini tidak boleh kosong!' }]}>
                    <AutoComplete
                        options={optionItem}
                        filterOption={false}
                        // style={{ width: 200 }}
                        onSelect={(value, option) => onSelectItem(value, false, option, index)}
                        onSearch={(value) => fetchItems(value, record, index)}
                        placeholder="Cari/Pilih Product"
                    />
                </Form.Item>
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
                <Form.Item label="" name={['items', index, 'condition']} rules={[{ required: true, message: 'Kondisi barang Harus Di Pilih' }]}>
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
                group: "inventory_id",
                request_column: ["product_id", "inventory_id","location_id", "price", "product_name", "unit_name",],
                request_column_relation: ["location"]
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                if(response.data.data.data.length > 0){
                    const resultResponse: Inventory[] = response.data.data.data;
                    const result = resultResponse.map((data: Inventory) => {
                        return {
                            value: `${data?.product_name} (${data.location?.name})`,
                            label: `${data?.product_name} (${data.location?.name})`,
                            object: data,
                        }
                    })
                    setOptionsItem(result);
                }else{
                    setOptionsItem([]);
                }
            }else{
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    }

    const onSelectItem = async (value: string, is_from: boolean, option: any, index: number,item?: TableInventory) => {
        console.log(option);
        if(option.object == undefined){
            // const newData = [...initialTable];
            // const selected: Inventory = option.object;
            // if(is_from){
            //     newData[index].product_name = selected.product_name!;
            //     newData[index].inventory_id_from = selected.inventory_id;
            // }else{
            //     newData[index].product_name_to = selected.product_name!;
            //     newData[index].inventory_id_exchange = selected.inventory_id;
                
            // }
            // newData[index].reference = 'exchange';
            // console.log(newData);
            // setInitialTable(newData);

        }else{
            const newData = [...initialTable];
            const selected: Inventory = option.object;
            console.log(selected);
            if(is_from){
                newData[index].product_name = selected.product_name!;
                newData[index].inventory_id_from = selected.inventory_id;
            }else{
                newData[index].product_name_to = selected.product_name!;
                newData[index].inventory_id_exchange = selected.inventory_id;
                
            }
            newData[index].reference = 'exchange';
            console.log(newData);
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
            form.setFieldValue('sales_number', sale.order_number);
            const initial = sale.items.map((value: SaleItem, index: number) => {
                return {
                    key: index, 
                    product_name: value.product_name,
                    product_photo: value.product_photo,
                    location_name: value.location_name!, 
                    stok: value.inventory.quantity, 
                    quantity: 1, 
                    available_quantity: value.inventory.quantity, 
                    id: null,
                    status: '',
                    condition: 'completed',
                    reference: 'exchange',
                    reference_id: '',
                    inventory_id: value.inventory_id ?? '',
                    unit_id: value.inventory.unit_id ?? '',
                    unit_name: value.inventory.unit_name ?? '',
                    inventory_id_from: value.inventory.inventory_id,
                    note: '',
                    movement_id_from: null,
                    inventory_id_exchange: null,
                    product_name_to: '',
                    product_photo_to: '',
                    price: parseInt(value.price),
                    sale_item_id: value.sale_item_id,
                    change_movement_id: null,
                }
            });
            setInitialTable(initial);
            form.setFieldValue('items', initial);
        }
    }

    const fetchSales = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'sales',
                request_column_relation: ["items", "items.inventory"],
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
                quantity: number,
                price: number,
                total_price: number,
                sales_item_id: string,
                item_change_condition: string,
                product_name: string,
                product_photo: string|null,
                location_name: string,
                unit_name: string,
                inventory_id_from: string,
                inventory_id_exchange: string,
                exchange_item_id?: string,
                change_movement_id?: string,
                movement_in?: string,
        }[] = initialTable.map((value: TableInventory) => ({
            quantity: value.quantity ?? 1,
            price: value.price,
            total_price: value.price * (value.quantity ?? 1),
            sales_item_id: value.sale_item_id!,
            item_change_condition: value.condition,
            product_name: value.product_name_to!,
            product_photo: value.product_photo,
            location_name: value.location_name!,
            unit_name: value.unit_name,
            inventory_id_from: value.inventory_id_from,
            inventory_id_exchange: value.inventory_id_exchange!,
            exchange_item_id: value.exchange_item_id,
            change_movement_id: value.change_movement_id!,
            movement_in: value.movement_in,
        }));

        const data = {
            "sales_id": form.getFieldValue('sales_id'),
            "sales_number": form.getFieldValue('order_number'),
            "status": form.getFieldValue('status'),
            "delivery_fee": form.getFieldValue('delivery_fee'),
            "delivery_number": form.getFieldValue('delivery_number'),
            "note": form.getFieldValue('note'),
            "items":items,
            'exchange_id': form.getFieldValue('exchange_id') ?? null,
        }

        

        console.log(data);

        setLoading(true);

        try {
            const response = await axiosInstance.post('/exchange', data);
            if(response.status == 200){
                message.success('Berhasil!');
               if(slug){
                fetchUpdateData();
               }else{
                form.resetFields();
                setInitialTable([]);
               }
            }
        } catch (error: any) {
            message.error(`${error?.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const fetchUpdateData = async() => {
        setLoading(true);
        try {
            const requestParam:RequestParam = {
                table: 'exchange',
                request_column: [],
                request_column_relation: ['items', 'items.movement','items.inventory_from','items.inventory_to', 'items.sale_item'],
                where: {
                    exchange_id: slug,
                },
                limit: 10,
                page: 1,
        
            };

            const response = await axiosInstance.post('/exchange/search', requestParam);

            if(response.data.data){
                const responseData: ExchangeType[] = response.data.data;
                const exchange: ExchangeType = responseData[0];

                form.setFieldValue('exchange_id', exchange.exchange_id);
                form.setFieldValue('sales_id', exchange.sales_id);
                form.setFieldValue('order_number', exchange.sales_number);
                form.setFieldValue('status', exchange.status);
                form.setFieldValue('delivery_fee', exchange.delivery_fee);
                form.setFieldValue('delivery_number', exchange.delivery_number);
                form.setFieldValue('note', exchange.note);
                const initial = exchange.items.map((value: ExchangeItem, index: number) => {
                    return {
                        key: index, 
                        product_name: value.sale_item?.product_name!,
                        product_photo: value.product_photo,
                        location_name: value.sale_item?.location_name!, 
                        stok: value.sale_item?.quantity ?? 0, 
                        quantity: value.quantity, 
                        available_quantity: value.sale_item?.quantity ?? 0, 
                        id: null,
                        status: '',
                        condition: value.item_change_condition,
                        reference: 'exchange',
                        reference_id: '',
                        inventory_id: value.inventory_id_exchange ?? '',
                        unit_id:  '',
                        unit_name: value.unit_name ?? '',
                        inventory_id_from: value.inventory_id_from,
                        note: '',
                        inventory_id_exchange: value.inventory_id_exchange,
                        product_name_to: value.inventory_to.product_name ?? '',
                        product_photo_to: value.inventory_to.product_photo ?? null,
                        price: value.price,
                        sale_item_id: value.sales_item_id,
                        change_movement_id: value.change_movement_id,
                        exchange_item_id: value.exchange_item_id,
                        movement_in: value.movement_in,
                    }
                });


                form.setFieldValue('items', initial);
                setInitialTable(initial);
            }
            
        } catch (error: any) {
            message.error(`${error?.response?.data?.message ?? error}`);
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(slug){
            console.log(slug)
            fetchUpdateData();
        }
    }, [slug])
    

    useEffect(()=> {
        const cookie = getCookie('exchange');
        if(cookie == undefined){
            form.setFieldsValue({
                'status': 'deliver_to_seller',
            });
        }else{
           setSlug(cookie); 
        }
    }, [])
    
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