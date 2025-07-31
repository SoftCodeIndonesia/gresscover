import { useEffect, useState } from "react";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, DatePicker, Collapse } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";
import { TableRowSelection } from "antd/es/table/interface";
import { object } from "zod";
import { handlePriceChange } from "@/utils/validate_price_change";
import { NewRequestParam, RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import Column from "antd/es/table/Column";
import { Tax } from "@/type/tax";
import { toFormatLaravel } from "@/utils/date_utils";
import { title } from "process";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Sale } from "@/type/sale";
import { getCookie } from "cookies-next";
import { validateDecimal } from "@/utils/validate_decimal";
import { GroupSetting } from "@/type/setting";
import { Platform } from "@/type/platform";
import { getPlatforms } from "@/utils/get_filters";


interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_id: string|null, 
    location_name: string|null, 
    location_id: string|null, 
    stok: number|null, 
    quantity: number|null, 
    sku: string|null, 
    price: number|null;
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
    sale_item_id?: string,
    sale_id?: string,
    // children: TableInventory[],
}

type SearchInventoryResult = {
    harga_beli: number,
    harga_jual: number,
    location_name: string,
    sku_induk: string,
    quantity: number,
    product_name: string,
    inventory_id: string,
    quantity_unit: number,
    unit_name: string,
    sku: string,
    barcode: string,
    nilai_asset: number,
    minimum: number,
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
    const [showTable, setShowTabel] = useState<boolean>(false);

    const [slug, setSlug] = useState<string | undefined>(undefined);
    const router = useRouter();

    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [initialTableTax, setInitialTableTax] = useState<Tax[]>([]);

    const [optionUnit, setOptionUnit] = useState<AutoCompleteProps['options']>([]);
    const [optionsLocation, setOptionsLocation] = useState<Location[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [sale_data, setData] = useState<Sale>();
    const [modalItem, setModalItem] = useState<boolean>(false);

    const [minimum, setMinimum] = useState<number>(0);
    const [total_quantity, setTotalQuantity] = useState<number>(0);

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
        if(option.object != undefined){

            const item: SearchInventoryResult = option.object;
            const newData = [...initialTable];

            newData[index].product_name = value;
            newData[index].sku = item.sku;
            newData[index].stok = item.quantity;
            newData[index].cost = item.harga_beli;
            newData[index].price = item.harga_jual;
            newData[index].selling_price = item.harga_jual * 1;
            newData[index].quantity = 1;
            newData[index].inventory_id = item.inventory_id;

            

            setInitialTable(newData);
            sumSubtotal(newData);
            form.setFieldsValue({
                items: {
                    [index]: {
                        selling_price: item.harga_jual * 1,
                    },
                },
            });

            sumTotalQuantity(newData);
            countTotalWithTax(initialTableTax, newData);

        }
    }

    const sumTotalQuantity = (data: TableInventory[]) => {
        const subtotal = data.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.quantity ?? 0); // Menjumlahkan nilai
        }, 0);
        setTotalQuantity(subtotal);
    }

    const sumSubtotal = (data: TableInventory[]) => {
        let subtotal = 0;

        data.forEach((value) => {
            // console.log(value);
            if(value.inventory_id != null){
                subtotal = Number(subtotal) + Number((value.selling_price ?? 0));
            }
        })

        

        setSubtotal(subtotal);
    }

    const columns: TableColumnsType<TableInventory> = [
      
        {
            title: "Item",
            dataIndex: "nama",
            fixed: 'left',
            
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item name={['items', index, 'product_name']} rules={[{ required: true, message: 'Field is required' }]} className="m-0">
                    <AutoComplete
                        options={optionItem}
                        filterOption={false}
                        style={{ width: '100%' }}
                        // onChange={(value) => onSelectItem(value, {}, index)}
                        onSelect={(value, option) => onSelectItem(value, option, index)}
                        onSearch={(value) => fetchItems(value, index)}
                        placeholder="Cari/Pilih Product"
                    />
                </Form.Item>
            ),
        },
        {
            title: "Quantity",
            dataIndex: "stok",
            width: 150,
            render: (_: any, record: TableInventory, index: number) => (
                <div className="flex items-center gap-3">
                    <Button type="primary" shape="circle" icon={<MinusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) - Number(1);
                        if(plus > 0){
                            const newData = [...initialTable];
                            newData[index].quantity = plus;

                            const selling_price = plus * newData[index].price!;
                            

                            newData[index].selling_price = selling_price;
                            setInitialTable(newData);
                            sumSubtotal(newData);
                            sumTotalQuantity(newData);
                            countTotalWithTax(initialTableTax, newData);
                            form.setFieldValue('items', newData);
                        }
                    }} />
                    <p>{record.quantity}/{record.stok}</p>
                    <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) + Number(1);
                        if(plus <= record.stok!){
                            const newData = [...initialTable];
                            newData[index].quantity = plus;

                            const selling_price = plus * newData[index].price!;
                            

                            newData[index].selling_price = selling_price;
                            setInitialTable(newData);
                            countTotalWithTax(initialTableTax, newData);
                            sumSubtotal(newData);
                            sumTotalQuantity(newData);
                            form.setFieldValue('items', newData);
                        }
                    }} />
                </div>
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            width: 200,
            align: 'right',
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item className="m-0" name={['items', index, 'selling_price']} rules={[{ required: true, message: 'Field is required' }]}>
                    <Input className="text-right" placeholder="Masukan Harga Jual" value={formatRupiah(record.selling_price ?? 0.0)} onChange={(e) => {
                        const newData = [...initialTable];
                        newData[index].selling_price = parseInt(handlePriceChange(e.target.value));
                        setInitialTable(newData);
                        setSubtotal(countSubtotal(newData));
                        countTotalWithTax(initialTableTax, newData);
                    }} />
                </Form.Item>
            ),
        },
        {
            title: "Hapus",
            dataIndex: "",
            width: 10,
            align: 'right',
            render: (_: any, record: TableInventory, index: number) => (
                <Button onClick={() => {
                    const newData = [...initialTable]
                    newData.splice(index, 1);
                    setInitialTable(newData)
                }}><DeleteOutlined/></Button>
            ),
        },
    ];

   

    const fetchItems = async (query: string, index: number) => {
       
        try {
            const querySearch: NewRequestParam = {
                limit: 100,
                page: 1,
                table: 'inventory',
                keyword: query,
                type: 'search',
                where: {
                    location_id: form.getFieldValue('location_id'),
                    quantity: ['>', 0],
                }
               
            }
            const response = await axiosInstance.post(`/inventory/search`, querySearch);
            if(response.status == 200){
                const items: Pagination<SearchInventoryResult> = response.data.data.data;
                
                console.log(items);
                if(items.data.length > 0){
                    const result = items.data?.map((data: SearchInventoryResult) => {
                        return {
                            value: `${data.product_name}`,
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

    const fetchLocation = async () => {
        try {
            const response = await axiosInstance.get(`/location`);
            if(response.status == 200){
                const locationResult: Location[] = response.data.data;
                
                if(locationResult.length > 0){
                    setOptionsLocation(locationResult);
                    
                }

            }
        } catch (error) {
            message.error(`${error}`);
            
        }
    }
    const fetchPlatform = async () => {
        const response = await getPlatforms();
        setPlatforms(response as unknown as Platform[]);
    }

    const countSubtotal = (data: TableInventory[]) => {
        const subtotal = data.reduce((accumulator, currentValue) => {
            return accumulator + (currentValue.selling_price ?? 0); // Menjumlahkan nilai
        }, 0);

        return subtotal;
    }

    const countTotalWithTax = (taxes: Tax[], data: TableInventory[]) => {
        const total_amount = countSubtotal(data);

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
        

        const items :{ inventory_id: string; quantity: number, sale_item_id?: string, } [] = [];
        initialTable.forEach(element => {
            if(element.inventory_id != '0'){
                items.push({
                    'sale_item_id': element.sale_item_id,
                    'inventory_id': element.inventory_id!,
                    'quantity': element.quantity!,
                });
            }
        });

        const data = {
            'sale_id': form.getFieldValue('sale_id') != null ? form.getFieldValue('sale_id') : null,
            'sale_date': toFormatLaravel(form.getFieldValue('sale_date')),
            'total_amount': subtotal,
            'payment_method': null,
            'order_number': form.getFieldValue('order_number'),
            'delivery_number': form.getFieldValue('delivery_number'),
            'status': form.getFieldValue('status'),
            'platform': form.getFieldValue('platform'),
            'taxes': initialTableTax,
            'items': items,
            "total_amount_before_tax": subtotal,
            "total_amount_after_tax": total,
            'total_quantity': total_quantity,
            'total_sku': items.length,
            'location_id': form.getFieldValue('location_id'),
            'location_name': form.getFieldValue('location_name'),
        }

        console.log(data);

        try {
            const response = await axiosInstance.post('/sales', data);
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
               if(slug){
                fetchEditData();
               }else{
                    form.resetFields();
                    setInitialTaxes();
                    setInitialTableData();
                    setInitialForm();
                    setTotal(0);
                    setSubtotal(0);
                    
                    // form.setFieldsValue({
                    //     sale_date: dayjs(),
                    //     status: 'sedang dikemas',
                    //     platform: 'shopee'
                    // })
               }
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }

    
    const setInitialTableData = () => {
        setInitialTable(Array.from({ length: 1 }, (_, index) => ({
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
            price: 0,
            // children: [],
        })));
    }

    const setInitialTaxes = () => {
        const settings = localStorage.getItem('settings');
        const settingsData: GroupSetting[] = JSON.parse(settings as string);

        var taxData: Tax[] = [];

        settingsData.forEach(element => {
            element.settings.forEach(setting => {
                if(setting.slug == "default-pilihan-untuk-potongan-penjualan" && setting.value != null){
                    const decodeValue = JSON.parse(setting.value as string)
                    taxData = decodeValue as Tax[];
                }
            });
        });


        if(taxData.length == 0){
            const tax = localStorage.getItem('taxs');
            taxData = JSON.parse(tax as string);
        }
        
        form.setFieldValue('taxes', taxData);
        setInitialTableTax(taxData);
    }

    const removeTaxes = async (data: Tax) => {
        setLoading(true);

        
        const sales_tax: string[] = [];
        sale_data?.taxes.forEach(element => {
            if(element.tax_id == data.tax_id){
                sales_tax.push(element.sale_tax_id);
            }
        });
        
        try {
            const response = await axiosInstance.post('/search_del', {table: 'tax_sales',data: sales_tax});
            if(response.status == 200){
                setInitialTableTax(initialTableTax.filter((value) => value.tax_id != data.tax_id));
            }
        } catch (error: any) {
            message.error(`${error?.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const addNewLine = () => {
        const newData = [...initialTable,{
            key: initialTable.length, 
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
            price: 0,
            // children: [],
        }]
        setInitialTable(newData);
    }

    const setInititalItemEdit = (items: Sale) => {
        setInitialTableData()
    }

    const fetchEditData = async () => {
        try {
            const request_param: RequestParam = {
                table: 'sales',
                limit: 1,
                page: 1,
                request_column_relation: ['items', 'items.movement','items.inventory', 'taxes', 'taxes.tax'],
                where: [
                    {
                        sale_id: slug,
                    }
                ],
                

            }

            const response = await axiosInstance.post('/search', request_param);

            if(response.data.data){
                const responseData: Pagination<Sale> = response.data.data;
                setData(responseData.data[0]);
                form.setFieldsValue({
                    sale_id: responseData.data[0].sale_id,
                    sale_date: dayjs(responseData.data[0].sale_date),
                    status: responseData.data[0].status,
                    platform: responseData.data[0].platform ?? 'shopee',
                    order_number: responseData.data[0].order_number,
                    delivery_number: responseData.data[0].delivery_number,
                    location_id: responseData.data[0].location_id,
                    location_name: responseData.data[0].location_name,
                    // def
                })

                const initials = responseData.data[0].items.map((value, index) => {
                    return {
                        key: index, 
                        product_name: value.product_name, 
                        product_id: value.inventory.product_id ?? '', 
                        stok: (value.inventory.quantity ?? 0) + (value.quantity ?? 0), 
                        sku: '', 
                        selling_price: parseInt(value.price) * value.quantity, 
                        cost: value.inventory.cost, 
                        minimum: 1,
                        checked: false,
                        location_id: value.inventory.location_id,
                        location_name: value.location_name,
                        cost_string: `${value.inventory.cost}`,
                        selling_price_string: `${parseInt(value.price) * value.quantity}`,
                        unit_id: value.inventory.unit_id,
                        unit_name: value.unit_name,
                        quantity: value.quantity,
                        inventory_id: `${value.inventory_id}`,
                        price: parseInt(value.price),
                        sale_id: value.sale_id,
                        sale_item_id: value.sale_item_id,
                        // children: [],
                    }
                });
                const taxes = responseData.data[0].taxes.map((value) => {
                    return {
                        max_value: value.tax.max_value,
                        name: value.name!,
                        tax_id: value.tax_id,
                        unit_value: value.unit_value!,
                        value: value.value,
                    }
                });

                form.setFieldValue('items', initials);
                form.setFieldValue('taxes', taxes);
                setInitialTableTax(taxes);
                setInitialTable(initials);
                setSubtotal(countSubtotal(initials));
                // setTotal(responseData.data[0].total_amount_after_tax);
                sumTotalQuantity(initials);
                countTotalWithTax(taxes, initials)
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`)
        } finally {
            setLoading(false);
        }
    }

    const setInitialForm = () => {
        const settings = localStorage.getItem('settings');
        const settingsData: GroupSetting[] = JSON.parse(settings as string);

       

        settingsData.forEach(element => {
            element.settings.forEach(setting => {
                if(setting.slug == "default-pilihan-untuk-platform-penjualan" && setting.value != null){
                    const decodeValue = JSON.parse(setting.value as string)
                    const platform = decodeValue as Platform;
                    form.setFieldValue('platform', platform.name)
                }else if(setting.slug == "default-pilihan-gudang-untuk-penjualan" && setting.value != null){
                    const decodeValue = JSON.parse(setting.value as string)
                    const location = decodeValue as Location;
                    form.setFieldValue('location_id', location.location_id)
                }
            });
        });


        form.setFieldsValue({
            sale_date: dayjs(),
            status: 'sedang dikemas',
            // platform: 'shopee'
        })
    }

    useEffect(() => {
        if(slug){
            fetchEditData();
        }
    }, [slug])


    useEffect(() => {
        fetchLocation();
        fetchPlatform();
        const sale_id = getCookie('sale_id');
        if(sale_id == undefined){
            setInitialTaxes();
            setInitialTableData();
            setInitialForm();
        }else{
            setSlug(sale_id);
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
                        title: 'Daftar Penjualan',
                        href: '/transaction/penjualan',
                    },
                    {
                        title: `Tambah Penjualan`,
                    }
                ]}
            />
            <Form
                layout={formLayout}
                form={form}
                // initialValues={form.getFieldsValue}
                style={{ maxWidth: '100%' }}
                // labelCol={{ span: 6 }}
                // wrapperCol={{ span: 14 }}
                onFinish={handleSubmit}
                disabled={loading}
            >
                
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1">
                        <Form.Item className="flex-1" label="Pilih Gudang Penjualan" name='location_id' rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]} >
                            <Select 
                                placeholder="Pilih Lokasi Awal Gudang"
                                options={optionsLocation.map((value) => ({label: value.name, value: value.location_id}))}
                                onSelect={(value, option) => {
                                    form.setFieldsValue({
                                        
                                        location_name: option.label,
                                    })

                                    // console.log(option);

                                    setShowTabel(true);
                                }}
                            ></Select>
                        </Form.Item>
                        
                        <Form.Item label="Nomor Pesanan" name="order_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <Input placeholder="Nomor Pesanan" />
                        </Form.Item>
                        <Form.Item label="Nomor Pengiriman" name="delivery_number" rules={[{ required: true, message: 'Please input nomor pesanan!' }]}>
                            <Input placeholder="Nomor Pengiriman" />
                        </Form.Item>
                    </div>
                    <div className="flex flex-col flex-1">
                        <Form.Item
                            label="Tanggal Penjualan"
                            name="sale_date"
                            rules={[{ required: true, message: 'Please input tanggal penjualan' }]}
                            style={{width: '100%'}}
                        >
                            <DatePicker defaultValue={dayjs()} width={`100%`} />
                        </Form.Item>
                        <Form.Item name="status" label="Status Pesanan" rules={[{ required: true , message: 'Please input status pesanan!'}]}>
                            <Select
                                defaultValue={'sedang dikemas'}
                                placeholder="Status Pesanan"
                                options={[
                                    {label: 'Sedang Dikemas', value: 'sedang dikemas'},
                                    {label: 'Dalam Pengiriman', value: 'dalam pengiriman'},
                                    {label: 'Pesanan Terkirim', value: 'pesanan terkirim'},
                                    
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear={false}
                            >
                            </Select>
                        </Form.Item>

                        <Form.Item name="platform" label="Platform" rules={[{ required: true , message: 'Please input platform!'}]}>
                            <Select
                                placeholder="platform penjualan"
                                options={platforms.map((value) => ({label: value.name, value: value.slug}))}
                                onChange={(value) => {console.log(value)}}
                                allowClear={false}
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
                            // rowSelection={rowSelection}
                            pagination={false} 
                            dataSource={initialTable} 
                            footer={() => <Button type="text" color="blue" onClick={addNewLine}>Tambah Baris</Button>}
                            summary={pageData => {
                                
        
                                return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 1} colSpan={1} align="right"><p className="font-bold">Subtotal</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 2} align="center">
                                            <p>{total_quantity}</p>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 3} align="right">
                                            <p>{formatRupiah(subtotal)}</p>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTableTax.length ?? 1) + 4} align="center" >
                                                        
                                                    </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    {initialTableTax.map((value: Tax, index: number) => {
                                        return <Table.Summary.Row key={index} className="text-right">
                                                    <Table.Summary.Cell  index={(initialTableTax.length ?? 2) + 1}  colSpan={1} align="right">
                                                        <div className="flex text-right flex-1 items-center justify-end">
                                                            <Button type="text" danger onClick={() => removeTaxes(value)}><CloseCircleOutlined/></Button> 
                                                            <p className="font-bold">{value.name}</p>
                                                        </div>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={(initialTableTax.length ?? 1) + 1} align="center" >
                                                        
                                                    </Table.Summary.Cell>
                                                    
                                                    
                                                    <Table.Summary.Cell index={(initialTableTax.length ?? 3) + 1} align="right"  >
                                                        
                                                    <Form.Item name={['taxes', index, 'value']} className="m-0">
                                                    <Input style={{margin: 0}} addonAfter={
                                                        
                                                        <Select  onChange={(value) => {
                                                            const newData = [...initialTableTax];
                                                            if(value == 'percent'){
                                                                newData[index].value = (newData[index].value! / subtotal) * 100;
                                                            }else{
                                                                newData[index].value = (subtotal * newData[index].value!) / 100;
                                                            }
                                                            newData[index].unit_value = value;

                                                            form.setFieldValue('taxes', newData);
                                                            setInitialTableTax(newData);
                                                            countTotalWithTax(newData, initialTable);
                                                        }} value={value.unit_value}>
                                                            <Select.Option value="percent">Percent</Select.Option>
                                                            <Select.Option value="nominal">Nominal</Select.Option>
                                                        </Select>
                                                    } placeholder="Masukan stok" min={1} step={0.1} onChange={(e) => {
                                                        
                                                        const newData = [...initialTableTax];
                                                        newData[index].value = parseFloat(validateDecimal(e.target.value));
                                                        console.log(parseFloat(validateDecimal(e.target.value)))
                                                        setInitialTableTax(newData);
                                                        countTotalWithTax(newData, initialTable);
                                                    }} />
                                                    </Form.Item>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={(initialTableTax.length ?? 4) + 1} align="center" >
                                                        
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                    })}
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 3} colSpan={1} align="right"><p className="font-bold">Total</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 2} align="center">
                                            <p>{total_quantity}</p>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTable.length ?? 1) + 4} align="right">
                                            <p>{formatRupiah(total)}</p>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={(initialTableTax.length ?? 1) + 5} align="center" >
                                                        
                                                    </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                                );
                            }}
                    />
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
                        <Button type="link" href="/transaction/penjualan" loading={loading} >Batal</Button>
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