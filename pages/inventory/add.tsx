import React, { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType } from "antd";
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

interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    stok: number|null, 
    sku: string|null, 
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
            const item: Item = option.object;
            const newData = [...initialTable];

            newData[index].product_name = item.name;
            newData[index].product_id = item.product_id;
            newData[index].sku = item.sku;
            newData[index].stok = item.stock_quantity;
            newData[index].cost = parseInt(item.cost);
            newData[index].selling_price = parseInt(item.price);
            newData[index].minimum = item.min_stock_quantity;
            newData[index].unit_id = item.unit?.type_id ?? '',
            newData[index].unit_name = item.unit?.name ?? '';

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
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={fetchItems}
                        placeholder="Cari/Pilih Product"
                    />
            ),
        },
        {
            title: "SKU",
            fixed: 'left',
            dataIndex: "sku",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan SKU Product" value={record.sku ?? ''} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].sku = e.target.value;
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "Gudang",
            dataIndex: "location",
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        showSearch
                        placeholder={'Cari/Tambahkan Gudang Baru'}
                        style={{ width: 200 }}
                        defaultActiveFirstOption={false}
                        suffixIcon={null}
                        filterOption={false}
                        onSearch={(value) => fetchLocation(value)}
                        onSelect={(value, option) => onSelect(value, option, index)}
                        notFoundContent={null}
                        options={optionsLocation}
                    />
            ),
        },
        
        {
            title: "STOK",
            dataIndex: "stok",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok"  min={1}  onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].stok = parseInt(e.target.value);
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "UOM",
            dataIndex: "unit",
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        value={record.unit_name}
                        options={optionUnit}
                        filterOption={false}
                        style={{ width: 100 }}
                        onSelect={(value, option) => onSelectItemUOM(value, option, index)}
                        onSearch={fetchUOM}
                        placeholder="Cari/Pilih Product"
                    />
            ),
        },
        {
            title: "COST",
            dataIndex: "cost",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan COST" value={formatRupiah(record.cost ?? 0.0)} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].cost = parseInt(handlePriceChange(e.target.value));
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan Harga Jual" value={formatRupiah(record.selling_price ?? 0.0)} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].selling_price = parseInt(handlePriceChange(e.target.value));
                    setInitialTable(newData);

                }} />
            ),
        },
        {
            title: "Minimum Stok",
            dataIndex: "minimum",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan Minimum Stok" value={record.minimum ?? 0.0} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].minimum = parseInt(e.target.value);
                    setInitialTable(newData);

                }} />
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

    const checkOnSelected = (item: Item) => {
        for (let index = 0; index < itemsSelected.length; index++) {
            const element = itemsSelected[index];
            if(element.item?.product_id == item.product_id){
                return true;
                break;
            }
            
        }

        return false;
    }

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        const item = e.target.value as Item;
        if (e.target.checked) {
            // Tambahkan ke list jika di-check
            setItemSelected((inv) => [...inv, {
                inventory_id: '',
                item: item,
                location_id: '',
                location: null,
                quantity: 0,
                minimum_stock: 0,
                price: 0,
                created_at: '',
                upadated_at: '',
                created_by: null,
            }]);

            // form.setFieldsValue({"item_" + item.product_id: ''})
          
            // console.log(result);
        } else {
          // Hapus dari list jika di-uncheck
          setItemSelected((prev) =>
            prev.filter((inv) => inv.item?.product_id !== item.product_id)
          );
        }

        

        


        // form.setFieldsValue(result);


        
      };

    const fetchItems = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'product',
                search: {
                    column: [
                        'name',
                        'sku',
                    ],
                    value: query,
                },
                request_column: ["name", "sku", "stock_quantity", "cost", "min_stock_quantity", "price", "unit_id", "product_id"],
                request_column_relation: ["unit"]
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<Item> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data?.map((data: Item) => {
                        return {
                            value: `${data.name}-${data.sku}`,
                            label: `${data.name}-${data.sku}`,
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

    const fetchLocation = async (search: string,) => {
        try {
            const response = await axiosInstance.get(`/location?name=${search}`);
            if(response.status == 200){
                const locationResult: Location[] = response.data.data;
                
                if(locationResult.length > 0){
                    const result = locationResult.map((data: Location) => {
                        return {
                            value: data.name,
                            label: data.name,
                            object: data,

                        }
                    })
                    setOptionsLocation(result);
                }else{
                    setOptionsLocation([
                        {
                            value: `${search}`,
                            label: `Tambahkan ${search}`,
                        }
                    ]);
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
            if(element.product_name != null){
                dataInitital.push({...element, type: 'in'});
            }
        });

        try {
            const response = await axiosInstance.post('/inventory', {'type': 'in', 'data': dataInitital });
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                setInitialTableData();
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


    const onSelect = (value: string, option: any, index: number) => {
        console.log(option);
            if(option.object == undefined){
    
                const newData = [...initialTable];
                newData[index].location_id = value;
                newData[index].location_name = value;
                setInitialTable(newData);
    
            }else{
                const item: Location = option.object;
                const newData = [...initialTable];
    
                newData[index].location_id = item.location_id;
                newData[index].location_name = item.name;
    
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
    };
    
    const setInitialTableData = () => {
        setInitialTable(Array.from({ length: 4 }, (_, index) => ({
            key: index, 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
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
        })));
    }
    

    useEffect(() => {
        setInitialTableData();
    }, []);


    
    return (
        <DashboardLayout>
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
                />

                <Form.Item className="mt-2">
                        <Button type="link" href="/inventory" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
              
        </DashboardLayout>
    );
}


export default AddInventory;