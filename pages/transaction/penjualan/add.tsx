import { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, DatePicker, Collapse } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";
import { TableRowSelection } from "antd/es/table/interface";
import { object } from "zod";
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import Column from "antd/es/table/Column";
import { Tax } from "@/type/tax";

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
    type?: string|null,
    inventory_id: string|null,
    // children: TableInventory[],
}

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

const AddTransactionSale: React.FC = () => {
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalPotongan, setModalPotongan] = useState<boolean>(false);
    const [potonganName, setPotonganName] = useState<string>('');
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);

    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [initialTableTax, setInitialTableTax] = useState<Tax[]>(Array.from({length: 1}, (index: number) => ({
        name: 'Admin',
        max_value: 0,
        tax_id: null,
        unit_value: 'percent',
        value: 0,
    })));

    const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
    const [optionsLocation, setOptionsLocation] = useState<AutoCompleteProps['options']>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [modalItem, setModalItem] = useState<boolean>(false);

    const [minimum, setMinimum] = useState<number>(0);

    const [form] = Form.useForm();

    const onChecked = (e: CheckboxChangeEvent, indexTable: number) => {
        setInitialTable((prevData) =>
            prevData.map((item, index) =>
                index == indexTable ? { ...item, checked: true } : item
            )
        );
    }

    const submitModalItem = () => {

    }

    const closeModalItem = () => {
        setModalItem(false);
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
            const item: Inventory = option.object;
            const newData = [...initialTable];

            newData[index].product_name = value;
            newData[index].product_id = item.item.product_id;
            newData[index].sku = item.item.sku;
            newData[index].stok = item.quantity;
            newData[index].cost = parseInt(item.item?.cost);
            newData[index].selling_price = item.price;
            newData[index].quantity = 1;
            newData[index].inventory_id = item.inventory_id;


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
            sumSubtotal(newData);

        }
    }

    const sumSubtotal = (data: TableInventory[]) => {
        let subtotal = 0;

        data.forEach((value) => {
            if(value.product_id != null){
                subtotal = Number(subtotal) + Number((value.selling_price ?? 0));
            }
        })

        setSubtotal(subtotal);
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
            title: "Item",
            dataIndex: "nama",
            fixed: 'left',
            
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        value={record.product_name}
                        options={optionItem}
                        filterOption={false}
                        style={{ width: '100%' }}
                        // onChange={(value) => onSelectItem(value, {}, index)}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={(value) => fetchItems(value, index)}
                        placeholder="Cari/Pilih Product"
                    />
            ),
        },
        {
            title: "Quantity",
            dataIndex: "stok",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <Input addonAfter={`/${record.stok}`} placeholder="Masukan stok" min={1}  onChange={(e) => {
                    
                    const newData = [...initialTable];
                    newData[index].quantity = parseInt(e.target.value == '' ? '0' : e.target.value);

                    const selling_price = newData[index].quantity > 0 ? newData[index].quantity * (newData[index].selling_price ?? 0) : newData[index].selling_price;
                    console.log(selling_price);

                    newData[index].selling_price = selling_price;
                    setInitialTable(newData);
                    sumSubtotal(newData);

                }} />
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            width: 200,
            render: (_: any, record: TableInventory, index: number) => (
                <Input placeholder="Masukan Harga Jual" value={formatRupiah(record.selling_price ?? 0.0)} onChange={(e) => {
                    const newData = [...initialTable];
                    newData[index].selling_price = parseInt(handlePriceChange(e.target.value));
                    setInitialTable(newData);

                }} />
            ),
        },
    ];

    const columnsPotongan: TableColumnsType<TableInventory> = [
        {
            title: "Nama Potongan",
            dataIndex: "name",
            
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
            title: "Jumlah",
            dataIndex: "value",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => (
                <AutoComplete
                        options={optionItem}
                        filterOption={false}
                        style={{ width: 200 }}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={(value) => fetchItems(value, index)}
                        placeholder="Cari/Pilih Product"
                    />
            ),
        },
        {
            title: "Unit",
            fixed: 'left',
            dataIndex: "unit_value",
            
            render: (_: any, record: TableInventory, index: number) => (
                <Select onChange={(value) => {}} value={'percent'}>
                    <Select.Option value="percent">Percent</Select.Option>
                    <Select.Option value="nominal">Nominal</Select.Option>
                </Select>
            ),
        },
        {
            title: "Hapus",
            dataIndex: "",
            render: (_: any, record: TableInventory, index: number) => (
                <Button type="primary" className="bg-red-500"><DeleteOutlined /></Button>
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

    const fetchItems = async (query: string, index: number) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'inventory',
                request_column_relation: ["item", "location", "item.parent"],
                search_relation: {
                    item: {
                        column: [
                            "name",
                            "sku"
                        ],
                        value: query
                    },
                    "item.parent": {
                        column: [
                            "name",
                            "sku"
                        ],
                        value: query
                    }
                },
                
                request_column: [],
               
            }
            const response = await axiosInstance.post(`/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<Inventory> = response.data.data;
                
                if(items.data.length > 0){
                    const result = items.data?.map((data: Inventory) => {
                        return {
                            value: `${data.item?.parent != null ? data.item?.parent?.name + '->' : ''}${data.item.name}->${data.location?.name}`,
                            label: `${data.item?.parent != null ? data.item?.parent?.name + '->' : ''}${data.item.name}->${data.location?.name}`,
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

    const countTotalWithTax = (taxes: Tax[]) => {
        const total_amount = subtotal;

        let total_tax_tax = 0;

        taxes.forEach(element => {
            if(element.unit_value == 'percent' && element.value != 0){
                total_tax_tax = Number(total_tax_tax) + Number((total_amount * (element.value! / 100)))
            }else if(element.unit_value == 'nominal' && element.value != 0){
                total_tax_tax = Number(total_tax_tax) + Number(element.value!);
            }
        });

        console.log(total_tax_tax);

        setTotal(Number(total_amount) - Number(total_tax_tax));
    }
    

    const handleSubmit = async () => {
        setLoading(true);
        
        const dateTime = new Date(form.getFieldValue('sale_date'));

        

        const items :{ inventory_id: string; quantity: number } [] = [];
        initialTable.forEach(element => {
            if(element.inventory_id != '0'){
                items.push({
                    'inventory_id': element.inventory_id!,
                    'quantity': element.quantity!,
                });
            }
        });

        const data = {
            'sale_date': dateTime.getTime(),
            'total_amount': total,
            'payment_method': null,
            'order_number': form.getFieldValue('order_number'),
            'delivery_number': form.getFieldValue('delivery_number'),
            'status': form.getFieldValue('status'),
            'platform': form.getFieldValue('platform'),
            'taxes': initialTableTax,
            'items': items,
        }

        console.log(data);
        
        // initialTable.forEach(element => {
        //     if(element.product_name != null){
        //         dataInitital.push({...element, type: 'in'});
        //     }
        // });

        try {
            const response = await axiosInstance.post('/sales', data);
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

        // var newData = itemsSelected.map((obj) => {return { ...obj, minimum_stock: minimum, price: price, quantity: stok }})
        // console.log(newData);
        // setItemSelected(newData);
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
            quantity: 0,
            inventory_id: '0',
            // children: [],
        })));
    }
    

    useEffect(() => {
        setModalItem(true);
        setInitialTableData();
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
                        title: 'Daftar Penjualan',
                        href: '/inventory/mutasi',
                    },
                    {
                        title: `Tambah Penjualan`,
                    }
                ]}
            />
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '100%' }}
                // labelCol={{ span: 6 }}
                // wrapperCol={{ span: 14 }}
                onFinish={handleSubmit}
                disabled={loading}
            >
                <Form.Item
                    label="Tanggal Penjualan"
                    name="sale_date"
                    rules={[{ required: true, message: 'Please input tanggal penjualan' }]}
                    style={{width: '100%'}}
                >
                    <DatePicker width={`100%`} />
                </Form.Item>
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1">

                        <Form.Item label="Nomor Pesanan" name="order_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <Input placeholder="Nomor Pesanan" />
                        </Form.Item>
                        <Form.Item label="Nomor Pengiriman" name="delivery_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <Input placeholder="Nomor Pengiriman" />
                        </Form.Item>
                    </div>
                    <div className="flex flex-col flex-1">
                        <Form.Item name="status" label="Status Pesanan" rules={[{ required: true , message: 'Please input status pesanan!'}]}>
                            <Select
                                placeholder="Status Pesanan"
                                options={[
                                    {label: 'Sedang Dikemas', value: 'sedang dikemas'},
                                    {label: 'Dalam Pengiriman', value: 'dalam pengiriman'},
                                    {label: 'Pesanan Terkirim', value: 'pesanan terkirim'},
                                    {label: 'Retur', value: 'retur'},
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear
                            >
                            </Select>
                        </Form.Item>

                        <Form.Item name="platform" label="Platform" rules={[{ required: true , message: 'Please input platform!'}]}>
                            <Select
                                placeholder="platform penjualan"
                                options={[
                                    {label: 'Shopee', value: 'shopee'},
                                    {label: 'Tokopedia', value: 'tokopedia'},
                                    {label: 'Tiktok', value: 'tiktok'},
                                    {label: 'Lazada', value: 'lazada'},
                                    {label: 'Blibli', value: 'blibli'},
                                    {label: 'Offline', value: 'offline'},
                                    {label: 'Lainya', value: 'lainya'},
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear
                            >
                            </Select>
                        </Form.Item>

                        
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined/>} className="my-3">Tambah item</Button>
                <div>
                    <Table 
                            columns={columns} 
                            loading={loading} 
                            rowKey={(record) => record.key ?? ''} 
                            rowSelection={rowSelection}
                            pagination={false} 
                            dataSource={initialTable} 
                            scroll={{ x: 'max-content' }}
                    />
                    <Table 
                            showHeader={false}   
                            loading={loading} 
                            rowKey={(record) => record.key ?? ''} 
                            pagination={false} 
                            dataSource={[{
                                key: "0",
                                
                            }]} 
                            scroll={{ x: 'max-content' }}
                    >
                        <Column title="" dataIndex="key" key="key" width={150} />
                        <Column title="" dataIndex="sku" key="sku" width={150} />
                        <Column title="" dataIndex="qty" key="qty" width={150} />
                        <Column title="" dataIndex="item" key="item" align="right" render={(_:any, record: Tax) => (<p>{'Subtotal'}</p>)} />
                        <Column title="" dataIndex="no" key="no" width={200} render={(_: any, record: any) => (
                            <Input placeholder="Masukan stok"  min={1} value={subtotal} readOnly/>
                        )} />
                    </Table>
                    <Table 
                            showHeader={false}   
                            loading={loading} 
                            rowKey={(record) => record.tax_id ?? ''} 
                            pagination={false} 
                            dataSource={initialTableTax} 
                            scroll={{ x: 'max-content' }}
                    >
                        <Column title="" dataIndex="" key="" width={150} />
                        <Column title="" dataIndex="sku" key="sku" width={150} />
                        <Column title="" dataIndex="qty" key="qty" width={150} />
                        <Column title="" dataIndex="item" key="item" align="right" render={(_:any, record: Tax) => (<p>{record.name}</p>)} />
                        <Column title="" dataIndex="no" key="no" width={200} render={(_: any, record: Tax, index: number) => (
                            <Input addonAfter={
                                <Select onChange={(value) => {
                                    const newData = [...initialTableTax];
                                    newData[index].unit_value = value;
                                    setInitialTableTax(newData);
                                    countTotalWithTax(newData);
                                }} value={'percent'}>
                                    <Select.Option value="percent">Percent</Select.Option>
                                    <Select.Option value="nominal">Nominal</Select.Option>
                                </Select>
                            } placeholder="Masukan stok"  min={1}  onChange={(e) => {
                                const newData = [...initialTableTax];
                                newData[index].value = parseInt(e.target.value == '' ? '0' : e.target.value);
                                setInitialTableTax(newData);
                                countTotalWithTax(newData);
                            }} />
                        )} />
                    </Table>
                    <Table 
                            showHeader={false}   
                            loading={loading} 
                            rowKey={(record) => record.key ?? ''} 
                            pagination={false} 
                            dataSource={[{
                                key: "0",
                                
                            }]} 
                            scroll={{ x: 'max-content' }}
                    >
                        <Column title="" dataIndex="key" key="key" width={150} />
                        <Column title="" dataIndex="sku" key="sku" width={150} />
                        <Column title="" dataIndex="qty" key="qty" width={150} />
                        <Column title="" dataIndex="item" key="item" align="right" render={(_:any, record: Tax) => (<p className="font-bold">{'Total'}</p>)} />
                        <Column title="" dataIndex="no" key="no" width={200} render={(_: any, record: any) => (
                            <Input placeholder="Masukan stok"  min={1} value={total} readOnly />
                        )} />
                    </Table>
                    <div className="flex justify-end">
                    <Button type="text" className="text-blue-500" onClick={() => setModalPotongan(true)}>Tambah Potongan Lain</Button>
                    </div>
                </div> 

                {/* <Collapse
                    items={[{ 
                            key: '1', 
                            label: 'Produk', 
                            children: <div>
                                <Table 
                                        columns={columns} 
                                        loading={loading} 
                                        rowKey={(record) => record.key ?? ''} 
                                        rowSelection={rowSelection}
                                        pagination={false} 
                                        dataSource={initialTable} 
                                        scroll={{ x: 'max-content' }}
                                />
                                <Table 
                                        showHeader={false}   
                                        loading={loading} 
                                        rowKey={(record) => record.key ?? ''} 
                                        rowSelection={rowSelection}
                                        pagination={false} 
                                        dataSource={initialTable} 
                                        scroll={{ x: 'max-content' }}
                                >
                                    <Column title="" dataIndex="name" key="name" width={150} />
                                    <Column title="" dataIndex="sku" key="sku" width={150} />
                                    <Column title="" dataIndex="qty" key="qty" width={150} />
                                    <Column title="" dataIndex="item" key="item" render={(_:any, record: any) => (<p>Admin</p>)} />
                                    <Column title="" dataIndex="no" key="no" width={150} render={(_: any, record: any) => (
                                        <Input addonAfter={`percent`} placeholder="Masukan stok"  min={1}  onChange={(e) => {
                                           
                        
                                        }} />
                                    )} />
                                </Table>
                            </div> 
                    }]}
                /> */}

                {/* <Collapse
                    className="mt-3"
                    items={[{ 
                            key: '2', 
                            label: 'Potongan', 
                            children: <Table 
                                columns={columnsPotongan} 
                                loading={loading} 
                                rowKey={(record) => record.key ?? ''} 
                                rowSelection={rowSelection}
                                pagination={false} 
                                dataSource={initialTable} 
                                scroll={{ x: 'max-content' }}
                        /> 
                    }]}
                /> */}

                

                <Form.Item className="mt-2">
                        <Button type="link" href="/inventory" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            <Modal title="Nama Potongan" open={modalPotongan} onOk={() => {
                setInitialTableTax([...initialTableTax, {
                    name: potonganName,
                    max_value: 0,
                    tax_id: potonganName,
                    unit_value: 'percent',
                    value: 0,
                }]);
                setModalPotongan(false);
            }} onCancel={() => setModalPotongan(false)}>
                <Input placeholder="Nama potongan" onChange={(e) => setPotonganName(e.target.value)} />
            </Modal>
           
        </DashboardLayout>
    );
}


export default AddTransactionSale;