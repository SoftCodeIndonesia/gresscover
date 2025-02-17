import React, { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "@/pages/component/DashboardLayout";
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
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { useRouter } from "next/router";
import Link from "next/link";
import { deleteCookie, getCookie } from "cookies-next";
import TextArea from "antd/es/input/TextArea";
import { InventoryMovement } from "@/type/inventory_movement";

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
    note?: string,
    // children: TableInventory[],
}


const InventoryOut: React.FC = () => {
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showTabel, setTableView] = useState<boolean>(false);
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [price, setPrice] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);

    const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
    const [optionsLocation, setOptionsLocation] = useState<Location[]>([]);
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
        
        if(option.object == undefined){

            const newData = [...initialTable];
            newData[index].product_name = value;
            setInitialTable(newData);

        }else{
            const item: Inventory = option.object;
            const newData = [...initialTable];

            newData[index].product_name = item.product_name ?? '';
            newData[index].product_id = item.product_id ?? '';
            newData[index].sku = item.item.sku;
            newData[index].quantity = 1;
            newData[index].before_stok = item.quantity;
            newData[index].after_stok = Number(item.quantity) - 1;
            newData[index].cost = item.cost;
            newData[index].selling_price = item.price;
            newData[index].minimum = item.minimum_stock;
            newData[index].unit_id = item.unit_id ?? '',
            newData[index].unit_name = item.unit_name ?? '';
            newData[index].location_id = item.location_id;
            newData[index].location_name = item.location?.name ?? '';
            newData[index].type = 'out';
            

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
                <AutoComplete
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
            ),
        },
        {
            title: "SKU",
            fixed: 'left',
            dataIndex: "sku",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan SKU Product" value={record.sku ?? ''} disabled/>
            ),
        },
        
        {
            title: "STOK Sekarang",
            dataIndex: "",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok" suffix={record.unit_name}  value={record.before_stok ?? 0} min={1}  disabled={true}/>
            ),
        },
        {
            title: "STOK Keluar",
            dataIndex: "stok",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok"  value={record.quantity ?? 1} min={1}  onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].quantity = parseInt(handlePriceChange(e.target.value));
                    newData[index].after_stok = newData[index].before_stok - newData[index].quantity;
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "STOK Akhir",
            dataIndex: "",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok" suffix={record.unit_name} value={record.after_stok ?? 1} min={1}  disabled={true}/>
            ),
        },
        {
            title: "Harga Beli",
            dataIndex: "cost",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan COST" value={formatRupiah(record.cost ?? 0.0)} disabled />
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan Harga Jual" value={formatRupiah(record.selling_price ?? 0.0)} disabled/>
            ),
        },
    ];
    
    

    const fetchItems = async (query: string) => {
       
        try {
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
                const items: Pagination<Inventory> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data?.map((data: Inventory) => {
                        return {
                            value: `${data.product_name}`,
                            label: `${data.product_name}`,
                            object: data,
                        }
                    })
                    setOptionsItem(result);
                }else{
                    setOptionsItem([
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

    
    

    const handleSubmit = async () => {
        setLoading(true);
        const dataInitital: any[] | undefined = [];
        
        initialTable.forEach(element => {
            if(element.quantity! > 0){
                dataInitital.push({...element, note: form.getFieldValue('note')});
            }
        });

        console.log(dataInitital);

        try {
            const response = await axiosInstance.post('/inventory', {'type': 'out', 'data': dataInitital });
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
        
        setItemSelected(newData);
    }


    
    const setInitialTableData = () => {
        setInitialTable(Array.from({ length: 1 }, (_, index) => ({
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
            type: 'out',
            note: '',
            // children: [],
        })));
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
            type: 'out',
            // children: [],
        });
        setInitialTable(table);
    }

    const getUpdateData = async () => {
        const cookie = getCookie('movement');
        if(cookie != undefined){
            const inventory_movement: InventoryMovement = JSON.parse(cookie);
            form.setFieldsValue({
                location_id: inventory_movement.inventory.location_id,
                reference_name: inventory_movement.inventory.location?.name,
                note: inventory_movement.note,
            })
            setInitialTable([
                {
                    key: 1, 
                    product_name: inventory_movement.product_name, 
                    product_id: inventory_movement.product_id, 
                    quantity: inventory_movement.quantity, 
                    after_stok: inventory_movement.after_stok,
                    before_stok: inventory_movement.before_stok,
                    sku: inventory_movement.item.sku, 
                    selling_price: inventory_movement.amount, 
                    cost: inventory_movement.inventory.cost, 
                    minimum: 1,
                    checked: false,
                    location_id: inventory_movement.inventory.location_id,
                    location_name: inventory_movement.inventory.location?.name ?? '',
                    cost_string: `${inventory_movement.inventory.cost}`,
                    selling_price_string: `${inventory_movement.amount}`,
                    unit_id: inventory_movement.unit_id,
                    unit_name: inventory_movement.unit_name,
                    type: 'out',
                    note: inventory_movement.note ?? '',
                    movement_id: inventory_movement.id,
                    // children: [],
                }
            ]);
        }
    }
    
    const getLocations = async () => {
        setLoading(true);
        try {
            const request_param: RequestParam = {
                table: 'location',
                limit: 10,
                page: 1,
                request_column: [],
                request_column_relation: [],
            }
            const response = await axiosInstance.post('/search', request_param);
            if(response.status == 200){
                setOptionsLocation(response.data.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    

    useEffect(() => {
        const cookie = getCookie('movement');
        
        if(cookie == undefined){
            setInitialTableData();
        }else{
            getUpdateData();
        }

        getLocations();
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
                        title: 'Daftar Barang Keluar',
                        href: '/inventory/in',
                    },
                    {
                        title: `Tambah Barang Keluar`,
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

                <Form.Item className="flex-1" label="Lokasi Awal Gudang" name='reference_name' rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]} >
                    <Select 
                        placeholder="Pilih Lokasi Awal Gudang"
                        options={optionsLocation.map((value) => {
                            return {
                                value: value.location_id,
                                label: value.name,
                                object: value,
    
                            }
                        })}
                        onSelect={(value, option) => {
                            form.setFieldsValue({
                                location_id: value,
                            });

                            setTableView(true);
                        }}
                    ></Select>
                    
                    {/* <AutoComplete
                            showSearch
                            className="w-full"
                            placeholder={'Cari/Tambahkan Gudang Baru'}
                            defaultActiveFirstOption={false}
                            suffixIcon={null}
                            style={{width: '50%'}}
                            filterOption={false}
                            onSearch={(value) => fetchLocation(value)}
                            notFoundContent={null}
                            options={optionsLocation}
                            onSelect={(value, option) => {
                                if(option.object == undefined){
                                    form.setFieldsValue({
                                        reference_id: value,
                                        reference: 'gudang',
                                        reference_name: value,
                                    })
                                }else{
                                    const location: Location = option.object;
                                    form.setFieldsValue({
                                        reference_id: location.location_id,
                                        reference: 'gudang',
                                        reference_name: location.name,
                                    })
                                }
                            }}
                    /> */}
                </Form.Item>

                <Form.Item label="Catatan" name="note">
                    <TextArea rows={4} />
                </Form.Item>
                
                
                <Table 
                    columns={columns} 
                    loading={loading} 
                    rowKey={(record) => record.key ?? ''} 
                    
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
              
        </DashboardLayout>
    );
}


export default InventoryOut;