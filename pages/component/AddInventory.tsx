import React, { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, DatePicker, Radio, Card, Upload, UploadFile, UploadProps } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
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
import { getLocation } from "@/utils/get_filters";
import dayjs from "dayjs";
import SomethingWrong from "./500";
import TextArea from "antd/es/input/TextArea";
import { toFormatLaravel } from "@/utils/date_utils";
import { SearchInventoryResult } from "@/type/search_inventory_result";
import { Movement } from "@/type/movement";




interface TableInventory {
    key: React.Key, 
    id: string|null,
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

interface AddInventoryParam {
    breadcrumb: JSX.Element,
}


const AddInventory: React.FC<AddInventoryParam> = ({breadcrumb}) => {
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
    const [locations, setLocation] = useState<Location[]>([]);

    const [minimum, setMinimum] = useState<number>(0);
    const [total_amount, setTotalAmount] = useState<number>(0);
    const [type, setType] = useState<string|null>(null);
    const [payment, setPayment] = useState<string>("0");
    
    const [fileList, setFileList] = useState<UploadFile[]>([
        
    ]);

    const handleChange: UploadProps['onChange'] = (info) => {
        let newFileList = [...info.fileList];
    
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        newFileList = newFileList.slice(-1);
    
        // // 2. Read from response and show file link
        newFileList = newFileList.map((file) => {
          if (file.response) {
            // Component will show file.url as link
            file.url = file.response.url;
          }
          return file;
        });
    
        setFileList(newFileList);
    };

    const props = {
        // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        onChange: handleChange,
        multiple: false,
    };

    

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
            sumTotalAmount(newData);
            form.setFieldValue('items', newData);
        }else{
            const item: SearchInventoryResult = option.object;

            

            const newData = [...initialTable];

            newData[index].product_name = item.product_name;
            newData[index].product_id = item.product_id;
            newData[index].sku = item.sku;
            newData[index].quantity = 1;
            newData[index].before_stok = item.quantity_unit;
            newData[index].after_stok = type == 'in' ? Number(item.quantity_unit) + 1 : item.quantity_unit - 1; 
            newData[index].cost = item.harga_beli;
            newData[index].selling_price = item.harga_jual;
            newData[index].minimum = item.minimum;
            newData[index].unit_id = item.unit_id,
            newData[index].unit_name = item.unit_name;

            setInitialTable(newData);
            form.setFieldValue('items', newData);
            sumTotalAmount(newData);
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
            width: '300',
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'product_name']} rules={[{ required: true, message: 'Product Tidak Ditemukan!' }]} className="m-0">
                    <AutoComplete
                        showSearch={true}
                            value={record.product_name}
                            options={optionItem}
                            filterOption={false}
                            style={{ width: 300 }}
                            onSelect={(value, option) => onSelectItem(value, option, index)}
                            onSearch={fetchItems}
                            
                            placeholder="Cari/Pilih Product"
                        />
                </Form.Item>
            ),
        },
        {
            title: "SKU",
            fixed: 'left',
            dataIndex: "sku",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'sku']} rules={[{ required: true, message: 'SKU Tidak Boleh Kosong!' }]} className="m-0">
                    <Input placeholder="Masukan SKU Product" value={record.sku ?? ''} readOnly disabled/>
                </Form.Item>
            ),
        },
        {
            title: "STOK Sekarang",
            dataIndex: "",
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan stok"  value={record.before_stok ?? 0} min={1}  disabled={true}/>
            ),
        },
        {
            title: type == 'in' ? "QTY Masuk" : "QTY Keluar",
            dataIndex: "stok",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'quantity']} rules={[{ required: true, message: 'QTY Tidak Boleh Kosong!' }]} className="m-0">

                    <Input placeholder="Masukan stok"  value={record.quantity ?? 1} min={1}  onChange={(e) => {
                        const newData = [...initialTable];
                        if(type == 'out'){
                            if(parseInt(handlePriceChange(e.target.value)) <= newData[index].after_stok){
                                newData[index].quantity = parseInt(handlePriceChange(e.target.value));
                                newData[index].after_stok = newData[index].before_stok - newData[index].quantity;
                                setInitialTable(newData);
                                sumTotalAmount(newData);
                            }else{
                                message.error(`Stok Harus Kurang Dari ${newData[index].before_stok}`);
                                form.setFieldValue('items', newData);
                            }
                        }else{
                            newData[index].quantity = parseInt(handlePriceChange(e.target.value));
                                newData[index].after_stok = Number(newData[index].before_stok) + Number(newData[index].quantity);
                                setInitialTable(newData);
                                sumTotalAmount(newData);
                        }
                    }} />

                </Form.Item>
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
                <Form.Item name={['items', index, 'unit_name']} rules={[{ required: true, message: 'Satuan Tidak Boleh Kosong!' }]} className="m-0">
                    <AutoComplete
                        value={record.unit_name}
                        options={optionUnit}
                        filterOption={true}
                        style={{ width: 100 }}
                        onChange={(value) => onSelectItemUOM(value, {}, index)}
                        onSelect={(value, option) => onSelectItemUOM(value, option, index)}
                        onSearch={fetchUOM}
                        placeholder="Cari/Pilih Product"
                    />
                </Form.Item>
                
            ),
        },
        {
            title: "Harga Beli",
            dataIndex: "cost",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'cost']} rules={[{ required: true, message: 'Harga Beli Tidak Boleh Kosong!' }]} className="m-0">
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
                <Form.Item name={['items', index, 'selling_price']} rules={[{ required: true, message: 'Harga Jual Tidak Boleh Kosong!' }]} className="m-0">
                    <Input placeholder="Masukan Harga Jual" value={formatRupiah(record.selling_price ?? 0.0)} onChange={(e) => {
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
                <Form.Item name={['items', index, 'minimum']} rules={[{ required: true, message: 'Minimum Stok Tidak Boleh Kosong!' }]} className="m-0">
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

    const back = () => router.back();
    

    const fetchItems = async (query: string) => {
       
        try {
            const querySearch: NewRequestParam = {
                limit: 100,
                page: 1,
                table: 'product',
                type: 'search',
                keyword: query,
                where: {location_id: ["in", [form.getFieldValue('location_id')]]}
            }
            const response = await axiosInstance.post(`/items/search`, querySearch);
            if(response.status == 200){
                const items: SearchInventoryResult[] = response.data.data;
                
                if(items.length > 0){
                    
                    if(type == 'in'){
                        const result = items?.map((data: SearchInventoryResult) => {
                            return {
                                value: `${data.product_name}`,
                                label: `${data.product_name} - ${data.barcode}`,
                                object: data,
                                key: `${data.product_id}`,
                            }
                        })
                        setOptionsItem(result);
                    }else{

                        const toSet: {
                            value: string,
                            label: string,
                            object: SearchInventoryResult,
                            key: string,
                        }[] = [];

                        items.forEach((data: SearchInventoryResult) => {
                            if(data.quantity > 0){
                                toSet.push({
                                    value: `${data.product_name}`,
                                    label: `${data.product_name} - ${data.barcode}`,
                                    object: data,
                                    key: `${data.product_id}`,
                                });
                            }
                        });

                        // var setItem = res

                        setOptionsItem(toSet);
                    }
                    
                    
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
    
    const sumTotalAmount = (data: TableInventory[]) => {
        var total = 0;
        data.forEach(element => {
            total += element.cost! * (element.quantity ?? 1);
        });
        setTotalAmount(total);
    }
// const formData = new FormData();
        // formData.append('movement_id', form.getFieldValue('movement_id'));
        // formData.append('movement_type', form.getFieldValue('type'));
        // formData.append('date', toFormatLaravel(form.getFieldValue('date')));
        // formData.append('is_payment', form.getFieldValue('is_payment'));
        // formData.append('payment_date', toFormatLaravel(form.getFieldValue('payment_date')));
        // formData.append('location_id', form.getFieldValue('location_id'));
        // formData.append('location_name', form.getFieldValue('location_name'));
        // formData.append('total_item', totalItem.toString());
        // formData.append('total_amount', total_amount.toString());
        // formData.append('data', initialTable);
        

    const handleSubmit = async () => {
        setLoading(true);
        const dataInitital: any[] | undefined = [];
        var totalItem = 0;
        initialTable.forEach((element, index) => {
            element.location_id = form.getFieldValue('location_id');
            element.location_name = form.getFieldValue('location_name');
            

            const formItems: TableInventory[] = form.getFieldValue('items');

            element.unit_id = formItems[index].unit_id;
            element.unit_name = formItems[index].unit_name;

            totalItem += Number(element.quantity ?? 0);

            dataInitital.push({...element});
        });

        
        const formData = new FormData();

        if(form.getFieldValue('movement_id') != undefined){

            formData.append('movement_id', form.getFieldValue('movement_id') ?? null);
        }
        formData.append('movement_type', form.getFieldValue('type'));
        formData.append('note', form.getFieldValue('note') ?? '');
        formData.append('date', toFormatLaravel(form.getFieldValue('date')));
        formData.append('is_payment', form.getFieldValue('is_payment'));
        formData.append('payment_date', toFormatLaravel(form.getFieldValue('payment_date')));
        formData.append('location_id', form.getFieldValue('location_id'));
        formData.append('location_name', form.getFieldValue('location_name'));
        formData.append('total_item', totalItem.toString());
        formData.append('total_amount', total_amount.toString());
        formData.append('data', JSON.stringify(dataInitital));
        
        if(fileList.length > 0 && !fileList[0].url){
            formData.append('image', fileList[0].originFileObj as Blob);
        }else if(fileList.length > 0){
            formData.append('image', fileList[0].name);
        }

        



        try {
            const response = await axiosInstance.post('/inventory', formData, {
                headers: {
                    "Content-Type": 'multipart/form-data',
                }
            });
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                const cookie = getCookie('movement_id');
                form.resetFields();
                if(cookie != undefined){
                    getUpdateData();
                }else{
                    setInitialTableData();
                    form.setFieldsValue({
                        date: dayjs(),
                        movement_id: type,
                        payment_date: dayjs(),
                        is_payment: '0',
                        type: type,
                    });
                    deleteCookie('inventory_id');
                }

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
                const item: Location = option.object;
                // setLoading(true);

                const newData = [...initialTable];

                try {
                    const querySearch: RequestParam = {
                        limit: 100,
                        page: 1,
                        table: 'inventory',
                        where: [
                            {
                                location_id: item?.location_id,
                                
                            },
                            {
                                product_id: record?.product_id,
                            }
                        ],
                        request_column: ["inventory_id","quantity"],
                        request_column_relation: [],
                        // whereHas: {
                        //     "location": {
                        //         "location_id": form.getFieldValue('reference_id')
                        //     }
                        // }
                    };

                    const response = await axiosInstance.post('/search', querySearch);
                    if(response.status == 200){
                        const items: Pagination<Inventory> = response.data.data;

                        if(items.data.length > 0){
                            const inventory: Inventory = items.data[0];
                            newData[index].quantity = record.quantity;
                            newData[index].before_stok = inventory.quantity;
                            newData[index].after_stok = inventory.quantity + (record.quantity ?? 0);
                            newData[index].type = 'in';
                            
                        }else{
                            newData[index].type = 'adjustment';
                        }
                    }
                } catch (error: any) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
    
                newData[index].location_id = item.location_id;
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
        const tableInit: TableInventory[] = Array.from({ length: 1 }, (_, index) => ({
            key: index, 
            id: null,
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
        form.setFieldValue('items', tableInit);
        setInitialTable(tableInit);
        
    }
    
    const newLine = () => {
        const table = [...initialTable];
        table.push({
            key: table.length + 1, 
            id: null,
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
        setInitialTable(table);
    }

    const getUpdateData = async () => {
        const cookie = getCookie('movement_id');
        
        if(cookie == undefined){
            return;
        }

        setLoading(true);
        try {

            const response = await axiosInstance.get('/movement/' + cookie);
            
            if(response.status == 200){
                const movemnetData: Movement = response.data.data;
                const item: TableInventory[] = movemnetData.items.map((value, index) => {
                    return {
                        key: index, 
                        movement_id: value.movement_id,
                        id: value.id,
                        product_name: value.product_name ?? '', 
                        product_id: value.product_id, 
                        quantity: value.quantity, 
                        before_stok: value.before_stok,
                        after_stok: value.after_stok,
                        sku: value.item.sku, 
                        selling_price: value.amount, 
                        cost: value.cost, 
                        minimum: value.item.min_stock_quantity,
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
                });

                if(movemnetData.image != null){
                    setFileList([
                        {
                            uid: '-1',
                            name: `${movemnetData.original_name}.${movemnetData.extension}`, // Nama file dari API
                            status: 'done',
                            url: `${process.env.NEXT_PUBLIC_API_URI}/storage/${movemnetData?.image}`, // URL file dari API
                        },
                    ]);
                }

                form.setFieldValue('items', item);

                const type = getCookie('type');

                form.setFieldsValue({
                    note: movemnetData.note,
                    location_id: movemnetData.location_id,
                    location_name: movemnetData.location_name,
                    date: dayjs(movemnetData.date),
                    movement_id: movemnetData.movement_id,
                    payment_date: dayjs(movemnetData.payment_date),
                    is_payment: movemnetData.is_payment.toString(),
                    type: type,
                })
                setInitialTable(item);
                sumTotalAmount(item);
            }

        } catch (error: any) {
            console.log(`${error}`);
        } finally {
            setLoading(false);
        }
    } 


    const fetchLocationOption = async () => {
        const response = await getLocation() as unknown as Location[]
        setLocation(response);
        const result = response.map((data: Location) => {
                            return {
                                value: `${data.location_id}`,
                                label: `${data.name}`,
                            }
                        })
                        console.log(result);
        setOptionsLocation(result);
    }

    useEffect(() => {
        fetchLocationOption();
        const cookie = getCookie('movement_id');
        const type = getCookie('type');
        
        if(type != undefined){
            setType(type);
            
            if(cookie == undefined){
                setInitialTableData();
                form.setFieldsValue({
                    date: dayjs(),
                    movement_id: cookie,
                    payment_date: dayjs(),
                    is_payment: '0',
                    type: type,
                });
            }else{
                
                getUpdateData();
            }
        }
    }, []);


    
    return (
        <>
            {breadcrumb}
            {type == null && <SomethingWrong/>}
            {type != null && 
                <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '100%' }}
                onFinish={handleSubmit}
                disabled={loading}
            >

                <Card title={`Form Tambah ${type == 'in' ? 'Barang Masuk' : 'Barang Keluar'}`} className="mb-6">
                    <div className="flex gap-6">
                        <div className="flex flex-col flex-1 pr-6">
                        
                            <Form.Item label="Pilih Gudang" name="location_id" rules={[{ required: true, message: 'Pilih Gudang Terlebih Dahulu!' }]}>
                                <Select disabled={form.getFieldValue('location_id')} onChange={(e) => {
                                    
                                    
                                    var location_selected: Location|null = null;

                                    locations.forEach(element => {
                                        if(element.location_id == e){
                                            location_selected = element;
                                        }
                                    });
                                    

                                    form.setFieldValue('location_name', location_selected!.name);
                                }}
                                options={optionsLocation}
                                >
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Tanggal"
                                name="date"
                                rules={[{ required: true, message: 'Pilih Tanggal Terlebih Dahulu!' }]}
                                style={{width: '100%'}}
                            >
                                <DatePicker defaultValue={dayjs()} width={`100%`} />
                            </Form.Item>
                            <Form.Item
                                label="Dokumen Tambahan (Nota Pembayaran, Bukti Penerimaan, dll)"
                                name="image"
                                style={{width: '100%'}}
                            >
                                <Upload {...props} fileList={fileList}>
                                    <Button icon={<UploadOutlined />}>Klik Untuk Upload</ Button>
                                </Upload>
                            </Form.Item>
                            
                        </div>
                        <div className="flex flex-col flex-1 px-6">
                            {type == 'in' && <>
                                <Form.Item label="Status Pembayaran" name="is_payment" rules={[{ required: true, message: 'Pilih Status Pembayaran Terlebih Dahulu!' }]}>
                                <Radio.Group onChange={(e) => {
                                    
                                    setPayment(e.target.value);
                                    
                                }}>
                                    <Radio value="1"> Lunas </Radio>
                                    <Radio value="0"> Belum Lunas </Radio>
                                </Radio.Group>
                            </Form.Item>
                            {payment == '1' && <Form.Item
                                label="Tanggal Pembayaran"
                                name="payment_date"
                                rules={[{ required: true, message: 'Pilih Tanggal Pembayaran Terlebih Dahulu!' }]}
                                style={{width: '100%'}}
                            >
                                <DatePicker defaultValue={dayjs()} width={`100%`} />
                            </Form.Item>}
                            </>}
                            <Form.Item label="Catatan" name="note">
                                <TextArea rows={4} />
                            </Form.Item>
                        </div>
                    </div>
                </Card>
                
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
                className="mb-4"
                    columns={columns} 
                    loading={loading} 
                    rowKey={(record) => record.key ?? ''} 
                    
                    pagination={false} 
                    dataSource={initialTable} 
                    scroll={{ x: 'max-content' }}
                    
                    footer={() => {
                        return (
                            <div className="flex justify-between items-center">
                                <Button type="text" onClick={newLine} className="text-blue-400">Tambah Baris</Button>
                                <div className="flex gap-10">
                                    <p className="text-lg font-bold">Total : </p>
                                    <p className="text-lg">{formatRupiah(total_amount)}</p>
                                </div>
                            </div>
                        );
                    }}
                />

               

                <Form.Item className="mt-4 flex gap-3 ">
                        <Button type="link" className="mr-3" onClick={back}>Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
        }
            
              
        </>
    );
}


export default AddInventory;