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

interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    stok: number|null, 
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
    parent_id: string|null,
    reference?: string,
    reference_id?:string,
    type: string,
    items: TableInventory[],
}


const MutasiBarang = () => {
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modal, setModalDetail] = useState<boolean>(false);
    const [parent_active, setParentActive] = useState<TableInventory|null>(null);
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [price, setPrice] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [initialTableVarian, setInitialTableVarian] = useState<TableInventory[]>([]);

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

    const setupVarian = (value: TableInventory) => {
        
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

    const onSelectItem = (value: string, option: any, index: number, is_varian?: boolean) => {
        console.log(option);
        if(is_varian){
            if(option.object == undefined){

                const newData = [...initialTableVarian];
                newData[index].product_name = value;
                newData[index].product_id = null;
                newData[index].parent_id = parent_active?.product_id ?? null;
                setInitialTableVarian(newData);
    
            }else{
                const item: Inventory = option.object;
                const newData = [...initialTableVarian];
    
                newData[index].product_name = item.item?.name;
                newData[index].product_id = item.item?.product_id;
                newData[index].sku = item.item?.sku;
                newData[index].stok = item.quantity;
                newData[index].quantity = 1;
                newData[index].type = 'mutation',
                newData[index].cost = parseInt(item.item?.cost);
                newData[index].selling_price = item.price;
                newData[index].minimum = item.minimum_stock;
                newData[index].unit_id = item.item?.unit_id ?? '',
                newData[index].unit_name = item.item?.unit_name ?? '';
                newData[index].location_id = item.location?.location_id ?? '',
                newData[index].location_name = item.location?.name ?? '',
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
                newData[index].type = 'mutation';
                newData[index].cost = parseInt(item.item?.cost);
                newData[index].selling_price = item.price;
                newData[index].minimum = item.minimum_stock;
                newData[index].unit_id = item.item?.unit_id ?? '';
                newData[index].unit_name = item.item?.unit_name ?? '';
                newData[index].location_id = item.location?.location_id ?? '';
                newData[index].location_name = item.location?.name ?? '';
                newData[index].key = `index_${index}${item.inventory_id}${item.location_id}${item.item.product_id}`

                const dataChildren:TableInventory[] = item.item.children.map((value: Item, index: number) => {
                    return {
                        key: `${value.product_id}`, 
                        product_name: value.name, 
                        product_id: value.product_id, 
                        location_name: '', 
                        location_id: '', 
                        stok: 0, 
                        quantity: 1, 
                        sku: value.sku, 
                        selling_price: parseInt(value.price), 
                        selling_price_string: value.price.toString(), 
                        cost: parseInt(value.cost), 
                        cost_string: value.cost.toString(), 
                        minimum: value.min_stock_quantity,
                        checked: false,
                        unit_id: value.unit_id,
                        unit_name: value.unit_name,
                        parent_id: value.parent_id,
                        reference: 'inventory',
                        reference_id:item.inventory_id,
                        type: 'in',
                        items: []
                    };
                });

                newData[index].items = dataChildren,

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
                width: 200,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                        value={record.product_name}
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onChange={(value) => onSelectItem(value, {}, index, true)}
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
                            onSelect={(value, option) => onSelect(value, option, index, true )}
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
                title: "Quantity",
                dataIndex: "stok",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="Masukan stok" type="number" value={record.stok ?? ''} onChange={(e) => {
                        const newData = [...initialTableVarian];
                        newData[index].stok = parseInt(handlePriceChange(e.target.value));
                        setInitialTableVarian(newData);
    
                    }} />
                ),
            },
            {
                title: "UOM",
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
                        value={record.product_name}
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onChange={(value) => onSelectItem(value, {}, index)}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={fetchItems}
                        placeholder="Cari/Pilih Product"
                    />
                ),
            },
            {
                title: "Gudang",
                dataIndex: "location",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <AutoComplete
                            value={record.location_name}
                            showSearch
                            placeholder={'Cari/Tambahkan Gudang Baru'}
                            style={{ width: 150 }}
                            defaultActiveFirstOption={false}
                            suffixIcon={null}
                            filterOption={false}
                            onChange={(value) => onSelect(value, {}, index)}
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
    
                    }} readOnly />
                ),
            },
            
            
            {
                title: "Quantity",
                dataIndex: "stok",
                width: 200,
                render: (_: any, record: TableInventory, index: number) => {
                    
                    return (
                        <Input placeholder="Masukan stok" type="number"  max={record.stok ?? 1} value={record.quantity ?? ''} onChange={(e) => {
                            const newData = [...initialTable];
                            newData[index].quantity = parseInt(e.target.value);
                            setInitialTable(newData);
        
                        }} />
                    );
                },
            },
            {
                title: "UOM",
                dataIndex: "unit",
                width: 150,
                render: (_: any, record: TableInventory, index: number) => (
                    <Input placeholder="UOM"  max={record.stok ?? 1} value={record.unit_name ?? ''} readOnly/>
                ),
            },
            {
                title: "Detail",
                dataIndex: "",
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
        var data = itemsSelected;

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
        var item = e.target.value as Item;
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

    const fetchItems = async (query: string, is_varian?: boolean, record?: TableInventory) => {
        
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
                request_column_relation: ["item", "location", "item.unit", "item.children"],
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
                        setOptionsItem([
                            {
                                value: `${query}`,
                                label: `${query}`,
                            }
                        ]);
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
                        setOptionsItem([
                            {
                                value: `${query}`,
                                label: `${query}`,
                            }
                        ]);
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

    const onSelect = (value: string, option: any, index: number, is_varian?: boolean, item?: TableInventory) => {
        console.log(option);
        console.log(is_varian);
        if(option.object == undefined){
            


            if(is_varian){
                const newData = [...initialTableVarian];
                newData[index].location_id = value;
                newData[index].location_name = value;
                setInitialTableVarian(newData);
            }else{
                const newData = [...initialTable];
            
                newData[index].location_id = value;
                newData[index].location_name = value;

                

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
                const item: Location = option.object;
                const newData = [...initialTableVarian];

                newData[index].location_id = item.location_id;
                newData[index].location_name = item.name;
                
        
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
        // setLoading(true);
        var dataInitital: any[] | undefined = [];
        
        initialTable.forEach(element => {
            if(element.product_id != null){
                if(element.items.length > 0){
                    dataInitital = dataInitital?.concat(element.items);
                }
                dataInitital?.push(element);
            }
        });

        console.log(dataInitital);

        try {
            const response = await axiosInstance.post('/inventory', {'type': 'mutation', 'data': dataInitital });
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

        var newData = itemsSelected.map((obj) => {return { ...obj, minimum_stock: minimum, price: price, quantity: stok }})
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
        const parent = [...initialTable];

        parent.forEach(element => {
            if(element.product_id == parent_active?.product_id){
                element.items = initialTableVarian.filter((value) => value.sku != null)
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
            sku: null, 
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
            reference_id: form.getFieldValue('reference_id'),
            reference: 'gudang',
        }]

        setInitialTableVarian(newData);
    }
    
    const setInitialTableData = () => {
        setInitialTable(Array.from({ length: 4 }, (_, index) => ({
            key: `${index}`, 
            product_name: null, 
            product_id: null, 
            stok: 0.0, 
            quantity: 0,
            sku: null, 
            selling_price: 0.0, 
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
    

    useEffect(() => {
        setInitialTableData();
        initialTableVarianData();
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
                <Form.Item className="flex-1" label="Lokasi Gudang" name='reference_name' rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]} >
                    <AutoComplete
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
                    />
                </Form.Item>

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
                
                <Form.Item className="mt-3">
                        <Button type="link" href="/items" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
        <Modal title="Varian Barang" open={modal} onOk={closeModal} onCancel={closeModal} width={'80%'}footer={[
          
         
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
                loading={loading} 
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