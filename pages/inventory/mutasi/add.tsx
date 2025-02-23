import { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";
import { TableRowSelection } from "antd/es/table/interface";
import { object, record } from "zod";
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { DefaultOptionType } from "antd/es/select";

interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    stok: number|null, 
    last_stok: number|null,
    quantity: number|null, 
    sku: string|null, 
    selling_price: number|null, 
    selling_price_string: string|null, 
    cost: number|null, 
    cost_string: string|null, 
    minimum: number|null,
    checked: boolean,
    unit_id: string|null,
    unit_name: string|null,
    unit_max_multiplier: number;
    parent_id: string|null,
    reference?: string,
    reference_id?:string,
    type: string,
    inventory_id?: string,
    items: TableInventory[],
}


const MutasiBarang = () => {
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modal, setModalDetail] = useState<boolean>(false);
    const [showTable, setShowTabel] = useState<boolean>(false);
    const [parent_active, setParentActive] = useState<TableInventory|null>(null);
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [price, setPrice] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [initialTableVarian, setInitialTableVarian] = useState<TableInventory[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
    const [optionsLocation, setOptionsLocation] = useState<AutoCompleteProps['options']>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [minimum, setMinimum] = useState<number>(0);

    const [form] = Form.useForm();

    const closeModal = () => {
        setParentActive(null);
        setModalDetail(false);
        initialTableVarianData();
    }

    const setupVarian = async (value: TableInventory) => {
        
        // var data: TableInventory[] = [{
        //     key: (Math.random() + 1).toString(36).substring(7), 
        //     product_name: null, 
        //     product_id: null, 
        //     stok: 0.0, 
        //     quantity: 0,
        //     sku: "", 
        //     selling_price: 0.0, 
        //     cost: 0.0, 
        //     minimum: 1,
        //     type: 'in',
        //     checked: false,
        //     location_id: '',
        //     location_name: '',
        //     cost_string: '0.0',
        //     selling_price_string: '0.0',
        //     unit_id: '',
        //     unit_name: '',
        //     parent_id: null,
        //     items: [],
        // }];

        // const varian = initialTable.find((parent) => parent.product_id == value.product_id)?.items ?? data;

        // setLoading(true);
        // try {

        //     const request_param:RequestParam  = {
        //         table: 'inventory',
        //         page: 1,
        //         limit: 10,
        //         where: [
        //             {
        //                 product_id: value.product_id,
        //             },
        //             {
        //                 location_id: value.location_id,
        //             }
        //         ],
        //         request_column:['inventory_id'],
        //         request_column_relation: []
        //     };
        //     const response = await axiosInstance.post('/search', request_param);

        //     if(response.status == 200){
        //         if(response.data.data.data.length > 0){
        //             value.inventory_id = response.data.data.data[0].inventory_id;
        //         }
        //     }else{
        //         message.error(response.statusText);
        //     }

        // } catch (error: any) {
        //     message.error(error);
        // } finally {
        //     setLoading(false);
        // }

        
        setInitialTableVarian(value.items);
        
        setParentActive(value);
        setModalDetail(true);
    }

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

    const onSelectItemUOM = (value: string, option: any, index: number, is_varian: boolean) => {
            console.log(option);
        if(option.object == undefined){

           if(is_varian){
            const newData = [...initialTableVarian];
            newData[index].unit_name = value;
            setInitialTableVarian(newData);
           }else{
            const newData = [...initialTable];
            newData[index].unit_name = value;
            setInitialTable(newData);
           }

        }else{
            if(is_varian){
                const item: ItemUnit = option.object;
                const newData = [...initialTableVarian];

                newData[index].unit_id = item.type_id ?? '',
                newData[index].unit_name = item.name ?? '';
                setInitialTableVarian(newData);
            }else{
                const item: ItemUnit = option.object;
                const newData = [...initialTable];

                newData[index].unit_id = item.type_id ?? '',
                newData[index].unit_name = item.name ?? '';  
                setInitialTable(newData);   
            }

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

            // console.log(newData[index]);

            // setInitialTable(newData);

        }
    }

    const onSelectItem = (value: string, option: DefaultOptionType, index: number, is_varian?: boolean) => {
        console.log(option);
        
        if(is_varian){
            if(option.object == undefined){

                const newData = [...initialTableVarian];
                newData[index].product_name = value;
                newData[index].product_id = null;
                newData[index].parent_id = parent_active?.product_id ?? null;
                setInitialTableVarian(newData);
    
            }else{
                const item: Item = option.object;
                const newData = [...initialTableVarian];
    
                newData[index].product_name = item.name;
                newData[index].product_id = item.product_id;
                newData[index].sku = item.sku;
                newData[index].stok = 0;
                newData[index].quantity = 1;
                newData[index].type = 'mutation';
                newData[index].cost = parseInt(item?.cost);
                newData[index].selling_price = parseInt(item.price);
                newData[index].minimum = item.min_stock_quantity;
                newData[index].unit_id = item.unit_id ?? '';
                newData[index].unit_name = item.unit_name ?? '';
                newData[index].parent_id = parent_active?.product_id ?? null;
                // if(item.item?.unit?.max_value != null && item.item?.unit?.max_value > 0){
                //     newData[index].children = Array.from({ length: item.item?.unit?.max_value }, (_, indexKey) => ({
                //         key: `${index}_${indexKey}`, 
                //         product_name: null, 
                //         product_id: null, 
                //         stok: 12, 
                //         sku: "", 
                //         selling_price: 0.0, 
                //         cost: 0.0, 
                //         quantity: 1,
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
    
                setInitialTableVarian(newData);
    
            }
        }else{
            if(option.object == undefined){

                const newData = [...initialTable];
                newData[index].product_name = value;
                newData[index].product_id = null;
                setInitialTable(newData);
    
            }else{
                const item: Inventory = option.object;
                const newData = [...initialTable];
    
                newData[index].product_name = item.item?.name;
                newData[index].product_id = item.item?.product_id;
                newData[index].sku = item.item?.sku;
                newData[index].stok = item.quantity;
                newData[index].quantity = 1;
                newData[index].last_stok = item.quantity - 1 ;
                newData[index].type = 'mutation';
                newData[index].cost = parseInt(item.item?.cost);
                newData[index].selling_price = item.price;
                newData[index].minimum = item.minimum_stock;
                newData[index].unit_id = item.item?.unit_id ?? '';
                newData[index].unit_name = item.item?.unit_name ?? '';
                newData[index].location_id = item.location?.location_id ?? '';
                newData[index].location_name = item.location?.name ?? '';
                newData[index].unit_max_multiplier = item.unit?.max_value ?? 1;
                newData[index].key = `index_${index}${item.inventory_id}${item.location_id}${item.item.product_id}`

                // const dataChildren:TableInventory[] = item.item.children.map((value: Item, index: number) => {
                //     return {
                //         key: `${value.product_id}`, 
                //         product_name: value.name, 
                //         product_id: value.product_id, 
                //         location_name: '', 
                //         location_id: '', 
                //         stok: 0, 
                //         last_stok: 1,
                //         quantity: 1, 
                //         sku: value.sku, 
                //         unit_max_multiplier: item.unit?.max_value ?? 1,
                //         selling_price: parseInt(value.price), 
                //         selling_price_string: value.price.toString(), 
                //         cost: parseInt(value.cost), 
                //         cost_string: value.cost.toString(), 
                //         minimum: value.min_stock_quantity,
                //         checked: false,
                //         unit_id: value.unit_id,
                //         unit_name: value.unit_name,
                //         parent_id: value.parent_id,
                //         reference: 'inventory',
                //         reference_id:item.inventory_id,
                //         type: 'in',
                //         items: []
                //     };
                // });

                // newData[index].items = dataChildren,

                // if(item.item?.unit?.max_value != null && item.item?.unit?.max_value > 0){
                //     newData[index].children = Array.from({ length: item.item?.unit?.max_value }, (_, indexKey) => ({
                //         key: `${index}_${indexKey}`, 
                //         product_name: null, 
                //         product_id: null, 
                //         stok: 12, 
                //         sku: "", 
                //         selling_price: 0.0, 
                //         cost: 0.0, 
                //         quantity: 1,
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
    }

    // const expandedRowRender = () => (
    //     <Table<ExpandedDataType>
    //       columns={expandColumns}
    //       dataSource={expandDataSource}
    //       pagination={false}
    //     />
    //   );

    

    const columnsVarian: TableColumnsType<TableInventory> = [
            {
                title: "Varian",
                dataIndex: "nama",
                fixed: 'left',
                width: 300,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                        showSearch
                        options={optionItem}
                        filterOption={true}
                        style={{ width: 300 }}
                        onSelect={(value, option) => onSelectItem(value, option, index, true)}
                        onSearch={(value) => fetchItems(value, true, parent_active!)}
                        placeholder="Cari/Pilih Varian"
                    />
                ),
            },
           
            {
                title: "Gudang",
                dataIndex: "location",
                width: 200,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                            showSearch
                            placeholder={'Cari/Tambahkan Gudang Baru'}
                            style={{ width: 200 }}
                            defaultActiveFirstOption={false}
                            suffixIcon={null}
                            filterOption={false}
                            onSearch={(value) => fetchLocation(value)}
                            onSelect={(value, option) => onSelect(value, option, index, true, record )}
                            notFoundContent={null}
                            options={optionsLocation}
                        />
                ),
            },
            {
                title: "SKU",
                fixed: 'left',
                dataIndex: "sku",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan SKU Product" value={record.sku ?? ''} onChange={(e) => {
                        const newData = [...initialTableVarian];
                        newData[index].sku = e.target.value;
                        setInitialTableVarian(newData);
    
                    }} />
                ),
            },
            {
                title: "Stok Sekarang",
                dataIndex: "",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan stok" type="number" value={record.stok ?? 0} disabled={true} readOnly/>
                ),
            },
            {
                title: "Quantity",
                dataIndex: "stok",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan stok" type="number" value={record.quantity ?? ''} onChange={(e) => {
                        const newData = [...initialTableVarian];
                        if(checkAllQuantity(parseInt(handlePriceChange(e.target.value)), record.product_id!) <= ((parent_active?.unit_max_multiplier ?? 1) * (parent_active?.quantity ?? 1))){
                             newData[index].quantity = parseInt(handlePriceChange(e.target.value));
                            newData[index].last_stok = (record.stok ?? 0) + newData[index].quantity;
                        }
                        setInitialTableVarian(newData);
    
                    }} />
                ),
            },
            
            {
                title: "Stok Akhir",
                dataIndex: "",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan stok" type="number" value={record.last_stok ?? ''} readOnly/>
                ),
            },
            {
                title: "Satuan",
                dataIndex: "unit",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                            value={record.unit_name}
                            options={optionUnit}
                            filterOption={false}
                            style={{ width: 100 }}
                            onChange={(value) => onSelectItemUOM(value, {}, index, true)}
                            onSelect={(value, option) => onSelectItemUOM(value, option, index, true)}
                            onSearch={fetchUOM}
                            placeholder="Cari/Buat UOM"
                        />
                ),
            },
            {
                title: "Harga",
                dataIndex: "selling_price",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan stok" type="number" value={record.selling_price ?? ''} onChange={(e) => {
                        const newData = [...initialTableVarian];
                        newData[index].selling_price = parseInt(handlePriceChange(e.target.value));
                        setInitialTableVarian(newData);
    
                    }} />
                ),
            },
            {
                title: "Operasi",
                dataIndex: "",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    index == 0 ? '' : <Button type="text" onClick={() => {
                        if(initialTableVarian.length > 1){
                            const newData = [...initialTableVarian].filter((data) => data.key != record.key);
                            setInitialTableVarian(newData);
                        }
                    }}>Hapus</Button>
                ),
            },
    ];
    const columns: TableColumnsType<TableInventory> = [
            {
                title: "Nama",
                dataIndex: "nama",
                fixed: 'left',
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                        options={optionItem}
                        filterOption={true}
                        style={{ width: 200 }}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={(value) => fetchItems(value,false, record)}
                        placeholder="Cari/Pilih Product"
                    />
                ),
            },
            {
                title: "Gudang Tujuan",
                dataIndex: "location",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                         
                            showSearch={false}
                            placeholder={'Cari/Tambahkan Gudang Baru'}
                            style={{ width: 150 }}
                            defaultActiveFirstOption={false}
                            suffixIcon={null}
                            filterOption={false}
                            // onChange={(value) => onSelect(value, {}, index)}
                            onSearch={(value) => fetchLocation(value)}
                            onSelect={(value, option) => onSelect(value, option, index, false, record)}
                            notFoundContent={null}
                            options={optionsLocation}
                        />

                ),
            },
            {
                title: "SKU",
                fixed: 'left',
                dataIndex: "sku",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan SKU Product" value={record.sku ?? ''} onChange={(e) => {
                        const newData = [...initialTable];
                        newData[index].sku = e.target.value;
                        setInitialTable(newData);
    
                    }} />
                ),
            },
            {
                title: "Stok Sekarang",
                dataIndex: "",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="UOM"  max={record.stok ?? 1} value={record.stok ?? ''} disabled={true} readOnly />
                ),
            },
            {
                title: "Quantity",
                dataIndex: "stok",
                width: 200,
                render: (_: any, record: TableInventory, index: number) => {
                    
                    return (
                        <Input placeholder="Masukan stok" type="number"  max={record.stok ?? 1} value={record.quantity ?? ''} onChange={(e) => {
                            const input = parseInt(handlePriceChange(e.target.value));
                            if(input < record.stok!){
                                const newData = [...initialTable];
                                newData[index].quantity = parseInt(e.target.value);
                                newData[index].last_stok = (record.stok ?? 0) - newData[index].quantity;
                                setInitialTable(newData);
                            }else{
                                const newData = [...initialTable];
                                newData[index].quantity = record.stok;
                                newData[index].last_stok = (record.stok ?? 0) - (newData[index].quantity ?? 0);
                                setInitialTable(newData);
                            }
                            
        
                        }} />
                    );
                },
            },
            {
                title: "Stok Akhir",
                dataIndex: "unit",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="UOM"  max={record.stok ?? 1} value={record.last_stok ?? '0'} disabled={true} readOnly />
                ),
            },
            {
                title: "Satuan",
                dataIndex: "unit",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="UOM"  max={record.stok ?? 1} value={record.unit_name ?? ''} readOnly />
                ),
            },
            {
                title: "Variasi",
                dataIndex: "",
                fixed: 'right',
                render: (_: any, record: TableInventory, index: number) => (
                    <Button type="text" className="text-blue-500" onClick={() => {
                        if(record.product_id != null){
                            setupVarian(record)
                        }
                    }}>{'Variasi'}</Button>
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

    

    // const insertNewItem = async (value: string, index: number) => {
    //     try {
    //         const response = await axiosInstance.post('/items', {'name': value, 'location': form.getFieldValue('reference_id')});
    //         if(response.status == 200){
    //             const newData = [...initialTable];
    //             newData[index].location_id = form.getFieldValue('reference_id');
    //             newData[index].product_id = 
    //         }
    //     } catch (error: any) {
    //         message.error(`${error.response?.data?.message}`);
    //     }
    // }

    const checkAllQuantity = (input: number, id?: string) => {
        const max = (parent_active?.unit_max_multiplier ?? 1)  * (parent_active?.quantity ?? 1);

        var currentAllQuantity = 0;

        initialTableVarian.forEach(element => {
            if(id != element.product_id){
                currentAllQuantity = currentAllQuantity + (element.quantity ?? 0);
            }
        });

        currentAllQuantity = currentAllQuantity + input;

        return currentAllQuantity;
        
    }  

    const fetchItems = async (query: string, is_varian?: boolean, record?: TableInventory, index?: number) => {
        
        try {
            const querySearch: RequestParam = is_varian ? {
                limit: 100,
                page: 1,
                table: 'product',
                search: {
                    value: query,
                    column: [
                        "name",
                        "sku",
                        "barcode",
                        "unit_name"
                    ]
                },
                where: [
                    {
                        parent_id: record?.product_id,
                    }
                ],
                request_column: [],
                request_column_relation: [],
                // whereHas: {
                //     "location": {
                //         "location_id": form.getFieldValue('reference_id')
                //     }
                // }
            } : {
                limit: 100,
                page: 1,
                table: 'inventory',
                search_relation: {
                    item: {
                        value: query,
                        column: [
                            "name",
                            "sku",
                            "barcode",
                            "unit_name"
                        ]
                    }
                },
                request_column: [],
                request_column_relation: ["item", "location", "item.unit", "item.children", "unit"],
                whereHas: {
                    "location": {
                        "location_id": form.getFieldValue('reference_id')
                    }
                }
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                if(is_varian){
                    const items: Pagination<Item> = response.data.data;
                
                    if(items.data.length > 0){
                        const result = items.data?.map((data: Item) => {
                            return {
                                value: `${data?.name}-${data?.sku}`,
                                label: `${data?.name}-${data?.sku}`,
                                object: data,
                            }
                        })
                        setOptionsItem(result);
                    }else{
                        setOptionsItem([]);
                    }
                }else{
                    const items: Pagination<Inventory> = response.data.data;
                
                    if(items.data.length > 0){
                        const result = items.data?.map((data: Inventory) => {
                            return {
                                value: `${data.item?.name}-${data.item?.sku}`,
                                label: `${data.item?.name}-${data.item?.sku}`,
                                object: data,
                            }
                        })
                        setOptionsItem(result);
                    }else{
                        setOptionsItem([]);
                    }
                }
            }else{
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    }

    const fetchItemsVarian = async (query: string) => {
        
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'product',
                search_relation: {
                    item: {
                        value: query,
                        column: [
                            "name",
                            "sku",
                            "barcode",
                            "unit_name"
                        ]
                    }
                },
                request_column: [],
                request_column_relation: ["item", "location", "item.unit"],
                whereHas: {
                    "location": {
                        "location_id": form.getFieldValue('reference_id')
                    }
                }
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<Inventory> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data?.map((data: Inventory) => {
                        return {
                            value: `${data.item?.name}-${data.item?.sku}`,
                            label: `${data.item?.name}-${data.item?.sku}`,
                            object: data,
                        }
                    })
                    setOptionsItem(result);
                }else{
                    setOptionsItem([
                        {
                            value: `${query}`,
                            label: `${query}`,
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
                            label: `${data.name}-${data.name}`,
                            object: data,
                        }
                    })
                    setOptionUnit(result);
                }else{
                    setOptionUnit([
                        {
                            value: `${query}`,
                            label: `${query}`,
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

    const onSelect = async (value: string, option: any, index: number, is_varian?: boolean, item?: TableInventory) => {
        console.log(option);
        console.log(is_varian);
        if(option.object == undefined){
            
            var location: Location = {
                location_id: "",
                parent_id: null,
                name: "",
                slug: "",
                created_by: 0,
                created_at: "",
                updated_at: "",
                parent: null
            };

            const response  = await axiosInstance.post('/location', {parent_id: null,name: value});
            if(response.status == 200){
                location = response.data.data;
            }

            if(is_varian){
                const newData = [...initialTableVarian];
                newData[index].location_id = location.location_id;
                newData[index].location_name = location.name;
                newData[index].reference = 'inventory';

                

                setInitialTableVarian(newData);
            }else{
                const newData = [...initialTable];
            
                newData[index].location_id = location.location_id;
                newData[index].location_name = location.name;

                

                if(item != undefined && item!.items.length > 0){
                    const dataChildren:TableInventory[] = item?.items.map((valueChild: TableInventory, index: number) => {
                        return {
                            ...valueChild,
                            location_name: value, 
                            location_id: value, 
                        };
                    });
    
                    newData[index].items = dataChildren;
                }

                setInitialTable(newData);
                
            }

        }else{
            
            if(is_varian){
                const dataItem: Location = option.object;

                setLoading(true);

                const newData = [...initialTableVarian];

                try {
                    const querySearch: RequestParam = {
                        limit: 100,
                        page: 1,
                        table: 'inventory',
                        where: [
                            {
                                location_id: item?.location_id,
                                product_id: item?.product_id,
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
                            newData[index].stok = inventory.quantity;
                            newData[index].last_stok = inventory.quantity + (item?.quantity ?? 1);
                            
                        }
                    }
                } catch (error: any) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
                newData[index].location_id = dataItem.location_id;
                newData[index].location_name = dataItem.name;
                
                console.log(newData);
        
                setInitialTableVarian(newData);

                
            }else{
                const location: Location = option.object;
                const newData = [...initialTable];

                newData[index].location_id = location.location_id;
                newData[index].location_name = location.name;
                console.log(item);
                if(item != undefined && item!.items.length > 0){
                    const dataChildren:TableInventory[] = item?.items.map((valueChild: TableInventory, index: number) => {
                        return {
                            ...valueChild,
                            location_name: value, 
                            location_id: value, 
                        };
                    });
    
                    newData[index].items = dataChildren;
                }
        
                setInitialTable(newData);
            }

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

                
    
        }
    };
    

    const handleSubmit = async () => {

        

        setLoading(true);
        let dataInitital: any[] | undefined = [];
        
        initialTable.forEach(element => {
            if(element.quantity! > 0){
                const newElement = {...element, location_id: form.getFieldValue('reference_id'), type: 'out', before_stok: element.stok, after_stok: (Number(element.stok) - Number(element.quantity))}
                
                if(element.items.length > 0){
                    
                    const filter = element.items.filter((item) => item.quantity! > 0);
                    const toConcat = filter.map((value) => {
                        return {...value, type: 'in', before_stok: value.stok, after_stok: (Number(value.stok) + Number(value.quantity))};
                    })
                    console.log(toConcat);

                    dataInitital?.push({
                        product_name: newElement.product_name,
                        quantity: newElement.quantity,
                        sku: newElement.sku,
                        items: [newElement].concat(toConcat),
                    });
                    // dataInitital = dataInitital?.concat(toConcat);
                }else{
                    dataInitital?.push({
                        product_name: newElement.product_name,
                        quantity: newElement.quantity,
                        sku: newElement.sku,
                        items: [newElement, {...element, type: 'in', before_stok: element.stok, after_stok: (Number(element.stok) - Number(element.quantity))}],
                    });
                }
                
            }
        });


        const to_store = {'mutations': dataInitital, 'from': form.getFieldValue('reference_id'), 'from_name': form.getFieldValue('reference_name')};

        console.log(to_store);
        

        try {
            const response = await axiosInstance.post('/mutations/store', to_store);
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


    // const onSelect = (value: string, option: any, names: any) => {
    //     console.log(option);
    //         if(option.object == undefined){
    
    //             form.setFieldsValue(names)
    
    //         }else{
    //             const item: Location = option.object;
    
    //             form.setFieldValue('location_id', item.location_id)
    //             form.setFieldValue('location_name', item.name);
    
    //         }
    // };

    const submitVarian = () => {
        
        if(checkAllQuantity(0, '') != ((parent_active?.unit_max_multiplier ?? 1) * (parent_active?.quantity ?? 1))){
            message.error(`Jumlah Quantity Mutasi Harus ${(parent_active?.unit_max_multiplier ?? 1) * (parent_active?.quantity ?? 1)}`);
            return;
        }

        const parent = [...initialTable];

        parent.forEach(element => {
            if(element.product_id == parent_active?.product_id){
                const to_input: TableInventory[] = initialTableVarian.filter((value) => value.sku != null)

                element.items = to_input.map((value) => {
                    const data = {
                        ...value,
                        reference_id: parent_active?.inventory_id,
                        
                    }
                    
                    return data;
                })
            }
        });

        setInitialTable(parent);

        closeModal();
    }

    const addNewVarian = () => {
        const newData: TableInventory[] = [...initialTableVarian, {
            key: (Math.random() + 1).toString(36).substring(7), 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
            quantity: 0,
            last_stok: 0,
            sku: null, 
            unit_max_multiplier: 12,
            selling_price: 0.0, 
            cost: 0.0, 
            minimum: 1,
            type: 'in',
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            parent_id: parent_active?.product_id!, 
            items: [],
            reference_id: parent_active?.inventory_id,
            reference: 'inventory',
        }]

        setInitialTableVarian(newData);
    }
    
    const setInitialTableData = () => {
        setInitialTable(Array.from({ length: 1 }, (_, index) => ({
            key: `${index}`, 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
            quantity: 0,
            last_stok: 0,
            sku: null, 
            selling_price: 0.0, 
            unit_max_multiplier: 12,
            cost: 0.0, 
            minimum: 1,
            type: 'out',
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            parent_id: null,
            items: [],
        })));
       
    }

    const initialTableVarianData = () => {
        setInitialTableVarian(Array.from({ length: 1 }, (_, index) => ({
            key: index, 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
            quantity: 0,
            sku: "", 
            selling_price: 0.0, 
            cost: 0.0, 
            unit_max_multiplier: 12,
            last_stok: 0,
            minimum: 1,
            type: 'in',
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            parent_id: null,
            items: [],
        })));
    }

    const fetchInitialLocation =  async () => {
        setLoading(true);
        try {
            const request_param: RequestParam = {
                table: 'location',
                limit: 10,
                page: 1,
                request_column_relation: []
            }
            const response = await axiosInstance.post('/search', request_param);
            setLocations(response.data.data.data);
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const newline = () => {
        const data = [...initialTable];
        data.push({
            key: `${data.length + 1}`, 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
            quantity: 0,
            last_stok: 0,
            sku: null, 
            selling_price: 0.0, 
            unit_max_multiplier: 12,
            cost: 0.0, 
            minimum: 1,
            type: 'out',
            checked: false,
            location_id: '',
            location_name: '',
            cost_string: '0.0',
            selling_price_string: '0.0',
            unit_id: '',
            unit_name: '',
            parent_id: null,
            items: [],
        });
        setInitialTable(data);
    }
    

    useEffect(() => {
        setInitialTableData();
        initialTableVarianData();
        fetchInitialLocation();
    }, []);


    
    return (
        <DashboardLayout>
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '100%' }}
                className="flex flex-col"
                onFinish={handleSubmit}
                disabled={loading}
            >
                <Form.Item className="flex-1" label="Lokasi Awal Gudang" name='reference_name' rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]} >
                    <Select 
                        placeholder="Pilih Lokasi Awal Gudang"
                        options={locations.map((value) => {
                            return {
                                value: value.location_id,
                                label: value.name,
                                object: value,
    
                            }
                        })}
                        onSelect={(value, option) => {
                            
                            if(option.object == undefined){
                                form.setFieldsValue({
                                    reference_id: value,
                                    reference: 'inventory',
                                    reference_name: value,
                                })
                            }else{
                                const location: Location = option.object;
                                form.setFieldsValue({
                                    reference_id: location.location_id,
                                    reference: 'inventory',
                                    reference_name: location.name,
                                })
                            }

                            setShowTabel(true);
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

                {/* {( selectedRowKeys.length > 0 && <div className="flex py-3 justify-between items-center">
                    <Space className="flex justify-end">
                        <p className="text-sm">Atur Sekaligus</p>
                        <Input placeholder="Harga" onChange={(e) => setPrice(parseInt(e.target.value))}></Input>
                        <Input placeholder="Stok" onChange={(e) => setStok(parseInt(e.target.value))}></Input>
                        <Input placeholder="Minimum" onChange={(e) => setMinimum(parseInt(e.target.value))}></Input>
                        <Button type="primary" onClick={applyBulkChange}>Terapkan</Button>
                    </Space>
                </div> )} */}
                
                {showTable && <Table 
                    columns={columns} 
                    loading={loading} 
                    rowKey={(record) => record.key ?? ''} 
                    rowSelection={rowSelection}
                    pagination={false} 
                    dataSource={initialTable} 
                    scroll={{ x: 'max-content' }}
                    footer={() => <Button type="text" onClick={newline} className="text-blue-400">Tambah Baris</Button>}
                />}
                
                <Form.Item className="mt-3">
                        <Button type="link" href="/items" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
        <Modal title="Varian Barang" open={modal}  onOk={closeModal} onCancel={closeModal} width={'80%'}footer={[
          
         
          <Button key="back" onClick={closeModal}>
            Batal
          </Button>,
           <Button
                key="link"
                type="primary"
                loading={loading}
                onClick={addNewVarian}
            >
                Tambah Varian
            </Button>,
            <Button key="submit" type="primary" loading={loading} onClick={submitVarian}>
                OK
            </Button>,
          
        ]}>
            <Table columns={columnsVarian} 
                rowKey={(record) => record.key ?? ''} 
                rowSelection={rowSelection}
                pagination={false} 
                dataSource={initialTableVarian} 
                scroll={{ x: 'max-content' }} 

            />

        </Modal>
        </DashboardLayout>
    );
}


export default MutasiBarang;