import React, { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";
import { TableRowSelection } from "antd/es/table/interface";
import { object } from "zod";
import { handlePriceChange } from "@/utils/validate_price_change";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { useRouter } from "next/router";
import Link from "next/link";
import { deleteCookie, getCookie } from "cookies-next";
import { InventoryMovement } from "@/type/inventory_movement";
import { SearchInventoryResult } from "@/type/search_inventory_result";

interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    quantity: number|null, 
    movement_id?: string,
    sku: string|null,
    before_stok: number,
    after_stok:number, 
    selling_price: number|null, 
    selling_price_string: string|null, 
    cost: number|null, 
    cost_string: string|null, 
    minimum: number|null,
    checked: boolean,
    unit_id: string|null,
    unit_name: string|null,
    type?: string|null,
    // children: TableInventory[],
}


const AddInventory: React.FC = () => {
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [price, setPrice] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);

    const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
    const [optionsLocation, setOptionsLocation] = useState<AutoCompleteProps['options']>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [minimum, setMinimum] = useState<number>(0);

    const router = useRouter();

    const [form] = Form.useForm();

    const onChecked = (e: CheckboxChangeEvent, indexTable: number) => {
        setInitialTable((prevData) =>
            prevData.map((item, index) =>
                index == indexTable ? { ...item, checked: true } : item
            )
        );
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<TableInventory> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    const onSelectItem = (value: string, option: any, index: number) => {
        console.log(option);
        if(option.object == undefined){

            const newData = [...initialTable];
            newData[index].product_name = value;
            setInitialTable(newData);

        }else{
            const item: SearchInventoryResult = option.object;
            const newData = [...initialTable];

            newData[index].product_name = item.product_name;
            newData[index].product_id = item.product_id;
            newData[index].sku = item.sku;
            newData[index].quantity = 1;
            newData[index].before_stok = 0;
            newData[index].after_stok = 1;
            newData[index].cost = item.harga_beli;
            newData[index].selling_price = item.harga_jual;
            newData[index].minimum = item.minimum;
            newData[index].unit_id = item.unit_id;
            newData[index].unit_name = item.unit_name;

           

            console.log(newData[index]);

            form.setFieldValue('items', newData);
            setInitialTable(newData);

        }
    }
    const onSelectItemUOM = (value: string, option: any, index: number) => {
        console.log(option);
        if(option.object == undefined){

            const newData = [...initialTable];
            newData[index].unit_name = value;
            setInitialTable(newData);

        }else{
            const item: ItemUnit = option.object;
            const newData = [...initialTable];

            newData[index].unit_id = item.type_id ?? '',
            newData[index].unit_name = item.name ?? '';

            // if(item.unit?.max_value != null && item.unit?.max_value > 0){
            //     newData[index].children = Array.from({ length: item.unit?.max_value }, (_, index) => ({
            //         key: index, 
            //         product_name: null, 
            //         product_id: null, 
            //         stok: 0.0, 
            //         sku: "", 
            //         selling_price: 0.0, 
            //         cost: 0.0, 
            //         minimum: 1,
            //         checked: false,
            //         location_id: '',
            //         location_name: '',
            //         cost_string: '0.0',
            //         selling_price_string: '0.0',
            //         unit_id: '',
            //         unit_name: '',
            //         children: [],
            //     }))
            // }

            console.log(newData[index]);

            setInitialTable(newData);

        }
    }

    

    const columns: TableColumnsType<TableInventory> = [
        {
            title: "Nama",
            dataIndex: "nama",
            fixed: 'left',
            width: 300,
            render: (_: any, record: TableInventory, index: number) => (
                <>
                    <Form.Item name={['items', index, 'product_id']} style={{minHeight: 0}} className="m-0 min-h-0" rules={[{ required: true, message: 'Product Tidak Boleh Kosong!' }]}><Input style={{minHeight: 0}} hidden  className="min-h-0"/></Form.Item>
                    <Form.Item name={['items', index, 'product_name']} className="m-0 min-h-0">
                        <AutoComplete
                            className="min-h-0"
                            showSearch
                            value={record.product_name}
                            options={optionItem}
                            filterOption={false}
                            style={{ width: 300 }}
                            onSelect={(value, option) => onSelectItem(value, option, index)}
                            onSearch={fetchItems}
                            onChange={(e) => onSelectItem(e, {}, index)}
                            placeholder="Cari/Pilih Product"
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            title: "SKU",
            fixed: 'left',
            dataIndex: "sku",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index,'sku']} rules={[{ required: true, message: 'SKU Tidak Boleh Kosong!' }]} className="m-0"><Input placeholder="Masukan SKU Product" value={record.sku ?? ''} disabled/></Form.Item>
            ),
        },
        {
            title: "Gudang",
            dataIndex: "location",
            render: (_: any, record: TableInventory, index: number) => (
                <>

                <Form.Item name={['items', index, 'location_id']} rules={[{ required: true, message: 'Gudang Tidak Boleh Kosong!' }]} className="m-0 min-h-0">
                    <Input hidden className="min-h-0"/>
                </Form.Item>
                <Form.Item name={['items', index, 'location_name']} className="m-0">
                    <AutoComplete
                        showSearch
                        value={record.location_name}
                        placeholder={'Cari/Tambahkan Gudang Baru'}
                        style={{ width: 200 }}
                        defaultActiveFirstOption={false}
                        suffixIcon={null}
                        filterOption={false}
                        onSearch={(value) => fetchLocation(value, record)}
                        onSelect={(value, option) => onSelect(value, option, index, record)}
                        notFoundContent={null}
                        options={optionsLocation}
                    />
                </Form.Item>

                </>
            ),
        },
        
        {
            title: "STOK Sekarang",
            dataIndex: "",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok" className="m-0"  value={record.before_stok ?? 0} min={1}  disabled={true}/>
            ),
        },
        {
            title: "STOK Masuk",
            dataIndex: "stok",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok" className="m-0" value={record.quantity ?? 1} min={1}  onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].quantity = parseInt(handlePriceChange(e.target.value));
                    newData[index].after_stok = newData[index].before_stok + newData[index].quantity;
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "STOK Akhir",
            dataIndex: "",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok"  value={record.after_stok ?? 1} min={1}  disabled={true}/>
            ),
        },
        {
            title: "Satuan",
            dataIndex: "unit",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'unit_name']} className="m-0" rules={[{ required: true, message: 'Satuan Tidak Boleh Kosong!' }]}><Input placeholder="Masukan satuan" /></Form.Item>
            ),
        },
        {
            title: "Harga Beli",
            dataIndex: "cost",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'cost']} className="m-0" rules={[{ required: true, message: 'Harga Beli Tidak Boleh Kosong!' }]}>
                    <Input placeholder="Masukan COST" value={formatRupiah(record.cost ?? 0.0)} onChange={(e) => {
                        const newData = [...initialTable];
                        newData[index].cost = parseInt(handlePriceChange(e.target.value));
                        setInitialTable(newData);

                    }} />
                </Form.Item>
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'selling_price']} className="m-0" rules={[{ required: true, message: 'Harga Jual Tidak Boleh Kosong!' }]}>
                    <Input placeholder="Masukan Harga Jual"  value={formatRupiah(record.selling_price ?? 0.0)} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].selling_price = parseInt(handlePriceChange(e.target.value));
                    setInitialTable(newData);

                }} />
                </Form.Item>
            ),
        },
        {
            title: "Minimum Stok",
            dataIndex: "minimum",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'minimum']} className="m-0">
                    <Input placeholder="Masukan Minimum Stok" value={record.minimum ?? 0.0} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].minimum = parseInt(e.target.value);
                    setInitialTable(newData);

                }} />
                </Form.Item>
            ),
        },
    ];

    const onChangeValue = (key: string, value: any, item: Inventory) => {
        const data = itemsSelected;

        data.forEach(element => {
            if(element.item?.product_id == item.item?.product_id){
                if(key == 'price'){
                    element.price = value;
                }else if(key == 'minimum'){
                    element.minimum_stock = value;
                }else if(key == 'qty'){
                    element.quantity = value;
                }

                console.log(element)
            }
        });

        console.log(data);

        setItemSelected(data);
    }
    

    const fetchItems = async (query: string) => {
       
        try {
            const querySearch: NewRequestParam = {
                limit: 100,
                page: 1,
                table: 'product',
                keyword: query,
                type: "search",
            }
            const response = await axiosInstance.post(`/items/search`, querySearch);
            if(response.status == 200){
                const items: SearchInventoryResult[] = response.data.data;
                
                if(items.length > 0){
                    const result = items?.map((data: SearchInventoryResult) => {
                        return {
                            value: `${data.product_name}-${data.barcode}`,
                            label: `${data.product_name}-${data.barcode}`,
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

    const fetchUOM = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'unit',
                search: {
                    column: [
                        'name',
                    ],
                    value: query,
                },
                request_column_relation: []
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<ItemUnit> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data.map((data: ItemUnit) => {
                        return {
                            value: `${data.type_id}`,
                            label: `${data.name}`,
                            object: data,
                        }
                    })
                    setOptionUnit(result);
                }else{
                    setOptionUnit([
                        {
                            value: `${query}`,
                            label: `Tambahkan ${query}`,
                        }
                    ]);
                }
            }else{
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    }

    const fetchLocation = async (search: string, record: TableInventory) => {
        try {
            const request = {
                product_id: record.product_id,
                keyword: search,
            };
            const response = await axiosInstance.post(`/inventory/location`, request);
            if(response.status == 200){
                const locationResult: {product_name: string|null, location_id: string, name: string, quantity: number}[] = response.data.data;
                
                if(locationResult.length > 0){
                    const result = locationResult.map((data: {product_name: string|null, location_id: string, name: string, quantity: number}) => {
                        return {
                            value: data.name,
                            label: data.name,
                            object: data,

                        }
                    })
                    setOptionsLocation(result);
                }else{
                    setOptionsLocation([]);
                }

            }
        } catch (error) {
            message.error(`${error}`);
            
        }
    }
    

    const handleSubmit = async () => {
        setLoading(true);
        const dataInitital: any[] | undefined = [];
        
        initialTable.forEach(element => {
            if(element.quantity! > 0){
                dataInitital.push({...element});
            }
        });

        console.log(dataInitital);

        try {
            const response = await axiosInstance.post('/inventory/initial', {'movement_type': 'in', 'data': dataInitital });
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                setInitialTableData();
                deleteCookie('inventory_id');
                router.back();
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }

    const applyBulkChange = async () => {

        const newData = itemsSelected.map((obj) => {return { ...obj, minimum_stock: minimum, price: price, quantity: stok }})
        console.log(newData);
        setItemSelected(newData);
    }


    const onSelect = async (value: string, option: any, index: number, record: TableInventory) => {
        console.log(option);
            if(option.object == undefined){
    
                const newData = [...initialTable];
                newData[index].location_id = value;
                newData[index].location_name = value;
                setInitialTable(newData);
    
            }else{
                const item: {product_name: string|null, location_id: string, name: string, quantity: number} = option.object;

                const newData = [...initialTable];
                newData[index].quantity = record.quantity;
                newData[index].before_stok = item.quantity;
                newData[index].after_stok = item.quantity + (record.quantity ?? 0);
                newData[index].type = 'in';
                newData[index].location_id = item.location_id;
                newData[index].location_id = item.location_id;
                newData[index].location_name = item.name;
                form.setFieldValue('items', newData);
                setInitialTable(newData);
    
            }
    };
    
    const setInitialTableData = () => {
        const initial = Array.from({ length: 1 }, (_, index) => ({
            key: index, 
            product_name: null, 
            product_id: null, 
            quantity: 0.0, 
            before_stok: 0.0,
            after_stok: 0.0,
            sku: "", 
            selling_price: 0.0, 
            cost: 0.0, 
            minimum: 1,
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            // children: [],
        }));

        form.setFieldValue('items', initial);
        setInitialTable(initial);
    }
    
    const newLine = () => {
        const table = [...initialTable];
        table.push({
            key: table.length + 1, 
            product_name: null, 
            product_id: null, 
            quantity: 0.0, 
            after_stok: 0.0,
            before_stok: 0.0,
            sku: "", 
            selling_price: 0.0, 
            cost: 0.0, 
            minimum: 1,
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            // children: [],
        });

        form.setFieldValue('items', table);
        setInitialTable(table);
    }

    const getUpdateData = async () => {
        const cookie = getCookie('id');
       
        if(cookie == undefined){
            return;
        }

        setLoading(true);
        try {
            
            const dataCookie:String[] = JSON.parse(cookie as string);

            const data = {data: dataCookie, type: ['in', 'adjustment']};

            const response = await axiosInstance.post('/inventory_edit', data);

            if(response.status == 200){
                const inventory: InventoryMovement[] = response.data.data;
                console.log(`${inventory}`);
                setInitialTable(inventory.map((value, index) => {
                    return {
                        key: index, 
                        id: value.id,
                        product_name: value.product_name ?? '', 
                        product_id: value.product_id, 
                        quantity: value.quantity, 
                        before_stok: value.before_stok,
                        after_stok: value.after_stok,
                        sku: value.inventory?.item?.sku, 
                        selling_price: value.amount, 
                        cost: value.cost, 
                        minimum: value.inventory?.minimum_stock,
                        checked: false,
                        location_id: value.inventory?.location_id,
                        location_name: value.inventory?.location?.name ?? '',
                        cost_string: `${value.cost}`,
                        selling_price_string: `${value.amount}`,
                        unit_id: value.unit_id,
                        unit_name: value.unit_name,
                        type: value.type,
                        // children: [],
                    };
                }));
            }

        } catch (error: any) {
            console.log(`${error}`);
        } finally {
            setLoading(false);
        }
    } 

    useEffect(() => {
        const cookie = getCookie('id');
        
        if(cookie == undefined){
            setInitialTableData();
        }else{
            getUpdateData();
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
                        title: 'Daftar Inventory',
                        href: '/inventory',
                        
                    },
                    {
                        title: `Tambah Inventory`,
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


                
                {( selectedRowKeys.length > 0 && <div className="flex py-3 justify-between items-center">
                    <Space className="flex justify-end">
                        <p className="text-sm">Atur Sekaligus</p>
                        <Input placeholder="Harga" onChange={(e) => setPrice(parseInt(e.target.value))}></Input>
                        <Input placeholder="Stok" onChange={(e) => setStok(parseInt(e.target.value))}></Input>
                        <Input placeholder="Minimum" onChange={(e) => setMinimum(parseInt(e.target.value))}></Input>
                        <Button type="primary" onClick={applyBulkChange}>Terapkan</Button>
                    </Space>
                </div> )}
                
                <Table 
                    columns={columns} 
                    loading={loading} 
                    rowKey={(record) => record.key ?? ''} 
                    rowSelection={rowSelection}
                    pagination={false} 
                    dataSource={initialTable} 
                    scroll={{ x: 'max-content' }}
                    footer={() => <Button type="text" onClick={newLine} className="text-blue-400">Tambah Baris</Button>}
                />

                <Form.Item className="mt-4 flex gap-3 ">
                        <Link type="link" className="mr-3" href="/inventory">Batal</Link>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            <style jsx global>{`
                .ant-form-item-control-input {
                    min-height: 0px !important;
                }
               
            `}</style>
        </DashboardLayout>
    );
}


export default AddInventory;