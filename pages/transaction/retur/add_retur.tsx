import { useEffect, useState } from "react";
import { ItemUnit } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Button, Form, Input, message, Select, Table, Modal, AutoComplete, AutoCompleteProps, TableColumnsType, Breadcrumb, Radio, Divider, Space, DatePicker, Upload, Checkbox, UploadProps, GetProp } from "antd";
import { LayoutType } from "@/type/form.layout";

import { DeleteFilled, DeleteOutlined, LoadingOutlined, MinusCircleOutlined, PlusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { handlePriceChange } from "@/utils/validate_price_change";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import { toFormatLaravel } from "@/utils/date_utils";
import dayjs from "dayjs";
import { Sale, SaleItem } from "@/type/sale";
import { InventoryMovement } from "@/type/inventory_movement";
import { getCookie } from "cookies-next";
import { Retur } from "@/type/retur";
import { formatRupiah } from "@/utils/format_rupiah";
// import styles from "./styles/add.component.css";


interface TableInventory {
    key: React.Key, 
    product_name: string|null, 
    product_photo: string|null, 
    location_name: string,
    unit_name: string,
    product_id: string|null, 
    stok: number|null, 
    quantity: number|null, 
    price: number|null, 
    id: string|null,
    retur_item_id?: string,
    condition: string,
    parent_index: number,
    sale_item_id?: string,
    inventory_id: string,
    retur_movement_id?: string,
    quantity_retur: number,
    quantity_sale: number,
    cost: number,
    type: "parent"| "child" | string,
}


const AddRetur: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [modalPotongan, setModalPotongan] = useState<boolean>(false);
    const [potonganName, setPotonganName] = useState<string>('');
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [total_lost, setTotalLost] = useState<number>(0);
    const [data, setData] = useState<Retur>();
    const [slug, setSlug] = useState<string>();
    const [initialTable, setInitialTable] = useState<TableInventory[]>([]);
    const [optionItem, setOptionsItem] = useState<AutoCompleteProps['options']>([]);

    const [form] = Form.useForm();

    const columns: TableColumnsType<TableInventory> = [
        {
            title: "Item",
            dataIndex: "nama",
            fixed: 'left',
            render: (_: any, record: TableInventory, index: number) => <p>{record.product_name} ({record.location_name})</p>
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
                            countTotalLost(newData);
                        }
                    }} />
                    <p>{record.quantity}/{record.stok}</p>
                    <Button type="primary" shape="circle" icon={<PlusCircleOutlined />} onClick={() => {
                        const plus = Number(record.quantity!) + Number(1);
                        if(plus <= record.stok!){
                            const newData = [...initialTable];
                            newData[index].quantity = plus;
                            setInitialTable(newData);
                            countTotalLost(newData);
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
                    <Form.Item name={['items', index, 'condition']} className="m-0">
                        <Radio.Group onChange={(value) => {
                                
                                // const parent: TableInventory = initialTable.filter((value) => value.key == record.key)[0];
                                const newData = [...initialTable];
                                newData[index].condition = value.target.value;
                                setInitialTable(newData);
                                countTotalLost(newData);
                                
                            }}>
                                <Radio value="completed"> Baik </Radio>
                                <Radio value="reject"> Buruk </Radio>
                        </Radio.Group>
                    </Form.Item>
                </>
            ),
        },
        {
            title: "Aksi",
            dataIndex: "",
            align: 'right',
            render: (_: any, record: TableInventory, index: number) => (
                <>
                    <Button onClick={() => removeItem(record)}>
                        <DeleteFilled/>
                    </Button>
                </>
            ),
        },
    ];
    
    const removeItem = (index: TableInventory) => {
        const initial = initialTable.filter((value) => value.key != index.key);
        setInitialTable(initial);
        countTotalLost(initial);
    }

    const countTotalLost = (tables: TableInventory[]) => {
        var total_lost = Number(form.getFieldValue('delivery_fee') ?? 0) ?? 0;

        tables.forEach(element => {
            if(element.condition == 'reject'){
                total_lost += Number(element.cost) * Number(element.quantity);
            }
        });

        console.log(total_lost);

        setTotalLost(total_lost);
    }

    const fetchSales = async (query: string) => {
       
        try {
            const querySearch: RequestParam = {
                limit: 100,
                page: 1,
                table: 'sales',
                request_column_relation: ["items", "items.movement"],
                search: {
                    column: [
                        "order_number"
                    ],
                    value: query,
                },
                request_column: ["order_number", "sale_id", "quantity_retur", "total_quantity"],
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

    const selectOrderNumber = (data: any) => {
        if(data.object != undefined){
            const sale: Sale = data.object;
            console.log(sale);
            if((sale.quantity_retur ?? 0) < (sale.total_quantity ?? 0)){
                form.setFieldValue('order_id', sale.sale_id);
                form.setFieldValue('order_number', sale.order_number);
                const initials: TableInventory[] = [];

                sale.items.forEach((value: SaleItem, index: number) => {
                    if(value.quantity_retur < value.quantity){
                        initials.push({
                            key: index, 
                            product_name: `${value.product_name}`, 
                            product_id: null, 
                            stok: Number(value.quantity) - Number(value.quantity_retur),
                            quantity: 1,
                            parent_index: -1,
                            id: `${index}`,
                            sale_item_id: value.sale_item_id,
                            product_photo: value.product_photo,
                            location_name: value.location_name,
                            unit_name: value.unit_name,
                            inventory_id: value.inventory_id,
                            price: parseInt(value.price),
                            type: "parent",
                            condition: "completed",
                            cost: parseInt(value.movement.cost?.toString() ?? '0'),
                            quantity_retur: value.quantity_retur,
                            quantity_sale: value.quantity,
                        });
                    }
                });

                // console.log()
                
                setInitialTable(initials)

                form.setFieldValue('items', initials);
                countTotalLost(initials);
            }else{
                form.setFieldValue('order_id', null);
                form.setFieldValue('order_number', null);
                message.error('Retur Sudah Melebihi Quantity Penjualan!');
            }
        }
    }
    
    const handleSubmit = async () => {
        setLoading(true);
        
        const values = form.getFieldsValue();

        const items :{ quantity: number, retur_movement_id?: string, retur_item_id?: string, inventory_id: string, price: number|null,item_retur_condition: string, sales_item_id?: string, product_name: string, product_photo: string|null, location_name: string, unit_name: string } [] = [];
        

    
        const trackings = values.trackings || [];
        const currentCount = trackings.filter((t: any) => t?.is_current).length;

        if (currentCount > 1) {
            message.error('Hanya boleh 1 status saat ini!');
            setLoading(false);
            return;
        }else if(currentCount == 0){
            message.error('Pilih Status Pengiriman Terakhir!');
            setLoading(false);
            return;
        }

        const formData = new FormData();


        formData.append('retur_id', values.retur_id ?? null);
        formData.append('retur_number', values.retur_number ?? null);
        formData.append('sales_id', values.order_id);
        formData.append('sales_number', values.order_number);
        formData.append('delivery_number', values.delivery_number);
        formData.append('status', values.status);
        formData.append('type', values.type_retur);
        formData.append('delivery_fee', `${values.delivery_fee || 0}`);
        formData.append('retur_item_loss', `${total_lost}`);

        initialTable.forEach((element, index) => {
            if(element.quantity! > 0){
                formData.append(`items[${index}][quantity]`, `${element.quantity}`);
                formData.append(`items[${index}][price]`, `${element.price}`);
                formData.append(`items[${index}][inventory_id]`, element.inventory_id);
                formData.append(`items[${index}][sales_item_id]`, `${element.sale_item_id}`);
                formData.append(`items[${index}][item_retur_condition]`, element.condition);
                formData.append(`items[${index}][product_name]`, element.product_name!);
                formData.append(`items[${index}][product_photo]`, `${element.product_photo}`);
                formData.append(`items[${index}][location_name]`, element.location_name);
                formData.append(`items[${index}][unit_name]`, element.unit_name);
                formData.append(`items[${index}][retur_item_id]`, element.retur_item_id || '');
                formData.append(`items[${index}][retur_movement_id]`, `${element.retur_movement_id}`);
            }
        });

        trackings.forEach((track: any, index: number) => {

            if(track.track_id){
                formData.append(`trackings[${index}][track_id]`, track.track_id ?? '');
            }

            formData.append(`trackings[${index}][description]`, track.description ?? '');

            // 📅 format date (WAJIB karena dari DatePicker)
            if (track.date) {
                formData.append(
                `trackings[${index}][date]`,
                track.date.format('YYYY-MM-DD HH:mm:ss')
                );
            }

            // 🔥 is_current (boolean → string)
            formData.append(
                `trackings[${index}][is_current]`,
                track.is_current ? '1' : '0'
            );

            const photo = track.photo;

            if (photo && Array.isArray(photo) && photo.length > 0) {
                const fileObj = photo[0];

                // 🔥 CASE 1: FOTO BARU UPLOAD
                if (fileObj.originFileObj) {
                    formData.append(
                        `trackings[${index}][photo]`,
                        fileObj.originFileObj
                    );
                }
            }

            // // 📸 photo
            // if (track.photo && track.photo.length > 0) {
            //     const file = track.photo[0].originFileObj;
            //     if (file) {
            //         formData.append(`trackings[${index}][photo]`, file);
            //     }
            // }
        });

        

        // const data = {
        //     'retur_id': values.retur_id ?? null,
        //     'retur_number': values.retur_number ?? null,
        //     'sales_id': values.order_id,
        //     'sales_number': values.order_number,
        //     'delivery_number': values.delivery_number,
        //     'status': values.status,
        //     'type': values.type_retur,
        //     'delivery_fee': values.delivery_fee,
        //     'retur_item_loss': total_lost,
        //     'items': items,
        // }

        // console.log(data);

        try {
            const response = await axiosInstance.post('/retur', formData, {
                headers: {
                    "Content-Type": 'multipart/form-data',
                }
            });
            if(response.status == 200){
                message.success(`${response?.data?.message}`)
                if(slug){
                    fetchEditData();
                }else{
                    setInitialTable([]);
                    setTotal(0);
                    setSubtotal(0);
                    form.resetFields();
                    form.setFieldsValue({
                        status: 'proses pengembalian',
                        type_retur: 'pengembalian'
                    })
                }
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`)
        } finally {
            setLoading(false);
        }
    }

    const fetchEditData = async () => {
        try {
            const retur_id = getCookie('retur_id');
            const request_param: RequestParam = {
                table: 'retur',
                limit: 1,
                page: 1,
                request_column_relation: ['items', 'items.movement','items.inventory', 'items.sale_item', 'trackings'],
                where: [
                    {
                        retur_id: retur_id,
                    }
                ],
                

            }

            const response = await axiosInstance.post('/search', request_param);

            if(response.data.data){
                const responseData: Pagination<Retur> = response.data.data;
                const retur: Retur = responseData.data[0];
                setData(retur);
                form.setFieldValue('retur_id', retur.retur_id);
                form.setFieldValue('retur_number', retur.retur_number);
                form.setFieldValue('order_id', retur.sales_id);
                form.setFieldValue('order_number', retur.sales_number);
                form.setFieldValue('delivery_number', retur.delivery_number);
                form.setFieldValue('status', retur.status);
                form.setFieldValue('type_retur', retur.type);
                form.setFieldValue('delivery_fee', retur.delivery_fee);
                const initials = retur.items.map((value, index) => {
                    return {
                        key: index, 
                        product_name: `${value.product_name}`, 
                        product_id: null, 
                        stok: (Number(value.sale_item?.quantity_retur) + Number(value.sale_item?.quantity) - Number(value.quantity)),
                        checked: false,
                        quantity: value.quantity,
                        parent_index: -1,
                        id: `${index}`,
                        sale_item_id: value.sales_item_id,
                        product_photo: value.product_photo,
                        location_name: value.location_name,
                        unit_name: value.unit_name,
                        inventory_id: value.inventory_id,
                        price: value.price,
                        type: "parent",
                        condition: value.item_retur_condition,
                        retur_item_id: value.retur_item_id,
                        retur_movement_id: value.retur_movement_id,
                        cost: parseInt(value.movement?.cost?.toString() ?? '0'),
                        quantity_retur: value.quantity,
                        quantity_sale: value.sale_item?.quantity ?? 0,
                        // children: [],
                    }
                });
                

                form.setFieldValue('items', initials);

                // const 

                form.setFieldValue('trackings', retur.trackings.map((track, index) => ({
                    track_id: track.track_id,
                    description: track.description,
                    date: track.date ? dayjs(track.date) : null,
                    is_current: track.is_current == 1 || track.is_current === 1,
                    preview: track.photo ? `${process.env.NEXT_PUBLIC_BE}/storage/${track.photo}` : '',
                })));

                console.log('trackings',)
                setInitialTable(initials);
                countTotalLost(initials);
            }

        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`)
        } finally {
            setLoading(false);
        }
    }



    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    const getBase64 = (img: FileType, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
    };

    const handleChange = (info: any, index: number) => {
        const file = info.file.originFileObj;

        

        if (file) {
            const previewUrl = URL.createObjectURL(file);

            const current = form.getFieldValue('trackings');

            console.log('current', current);

            // const trackings = Array.isArray(current) ? current : [];

            // trackings[index] = {
            // ...trackings[index],
            // photo: previewUrl,
            // file: file,
            // };

            current[index].photo = previewUrl
            current[index].file = file

            form.setFieldValue('trackings', current);

            console.log(form.getFieldValue('trackings'))
        }
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 0, fontSize: 10,  }}>Upload</div>
        </button>
    );


    useEffect(() => {
        if(slug){
            console.log(slug)
            fetchEditData();
        }
    }, [slug])
    

    useEffect(() => {
        const retur_id = getCookie('retur_id');
        
        if(retur_id == undefined){
            form.setFieldsValue({
                status: 'proses pengembalian',
                type_retur: 'pengembalian'
            })
        }else{
            setSlug(retur_id);
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
                        title: 'Daftar Retur',
                        href: '/transaction/retur',
                    },
                    {
                        title: `Buat Retur`,
                    }
                ]}
            />
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout, trackings: [] }}
                style={{ maxWidth: '100%' }}
                onFinish={handleSubmit}
                disabled={loading}
            >
                <div className="flex gap-4">
                    <div className="flex flex-col flex-1">
                        <Form.Item name="order_id" hidden />
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
                        <Form.Item label="Biaya Pengiriman/Kerugian" name="delivery_fee">
                            <Input placeholder="Biaya Pengiriman/Kerugian" onChange={(e) => {
                                // form.setFieldValue('delivery_fee')
                                countTotalLost(initialTable);
                            }} />
                        </Form.Item>
                    </div>
                    <div className="flex flex-col flex-1">
                        <Form.Item name="status" label="Status Retur" rules={[{ required: true , message: 'Please input tipe retur!'}]}>
                            <Select
                               
                                placeholder="Status Retur"
                                options={[
                                    {label: 'Proses Pengembalian', value: 'proses pengembalian'},
                                    {label: 'Selesai', value: 'selesai'},
                                ]}
                                onChange={(value) => {console.log(value)}}
                                allowClear
                            >
                            </Select>
                        </Form.Item>

                        <Form.Item name="type_retur" label="Tipe Retur" rules={[{ required: true , message: 'Please input tipe retur!'}]}>
                            <Select
                                options={[
                                    {label: 'Pengembalian', value: 'pengembalian'},
                                    {label: 'Pembatalan pembeli', value: 'pembatalan pembeli'},
                                ]}
                                allowClear
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
                            pagination={false} 
                            dataSource={initialTable} 
                            scroll={{ x: 'max-content' }}
                            summary={pageData => {
                                var total_loss_item = 0;

                                pageData.forEach(element => {
                                    if(element.condition == 'reject'){
                                        total_loss_item += element.cost * (element.quantity ?? 1);
                                    }
                                });

                                // total_loss += Number(form.getFieldValue('delivery_fee') ?? 0);
                                
                                return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={1} colSpan={3} align="right"><p className="font-normal">Kerugian Ongkos Kirim/Lainya</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            <p>{formatRupiah(form.getFieldValue('delivery_fee') ?? 0)}</p>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={1} colSpan={3} align="right"><p className="font-normal">Kerugian Barang</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            <p>{formatRupiah(total_loss_item)}</p>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={1} colSpan={3} align="right"><p className="font-bold">Total Kerugian</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2} align="right">
                                            <p>{formatRupiah(total_lost ?? 0)}</p>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                                );
                            }}
                           
                    />
                    
                </div> 

                <Divider orientation="left">Delivery Tracking</Divider>

                <Form.List name="trackings">
                {(fields, { add, remove }) => (
                    <>
                    {fields.map(({ key, name, ...restField }) => (
                        <Space
                        key={key}
                        align="center"
                        style={{ display: 'flex', marginBottom: 8 }}
                        >

                        <Form.Item
                            {...restField}
                            name={[name, 'is_current']}
                            valuePropName="checked"
                            >
                            <Radio
                                checked={form.getFieldValue(['trackings', name, 'is_current'])}
                                onChange={() => {
                                const trackings = form.getFieldValue('trackings') || [];

                                const newTrackings = trackings.map((item: any, index: number) => ({
                                    ...item,
                                    is_current: index === name, // 🔥 hanya yang dipilih true
                                }));

                                form.setFieldsValue({ trackings: newTrackings });
                                }}
                            >
                                Jadikan status saat ini
                            </Radio>
                        </Form.Item>
                        
                        {/* 📸 PHOTO */}
                        <Form.Item
                            {...restField}
                            name={[name, 'photo']}
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList;
                            }}
                            
                            >
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                action=""
                                style={{ width: 60, height: 60 }}
                                onChange={(info) => {
                                    const file = info.file.originFileObj;

                                    if (file) {
                                        const previewUrl = URL.createObjectURL(file);

                                        const trackings = form.getFieldValue('trackings') || [];

                                        if (!trackings[name]) trackings[name] = {};

                                        trackings[name].preview = previewUrl; // ✅ simpan preview terpisah

                                        form.setFieldsValue({ trackings });
                                    }
                                }}
                            >
                                {form.getFieldValue(['trackings', name, 'preview']) ? (
                                <img draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={form.getFieldValue(['trackings', name, 'preview'])} alt="avatar"  />
                                ) : (
                                uploadButton
                                )}
                            </Upload>
                        </Form.Item>

                        {/* 📝 DESCRIPTION */}
                        <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            rules={[{ required: true, message: 'Isi deskripsi!' }]}
                        >
                            <Input placeholder="Deskripsi tracking" />
                        </Form.Item>

                        {/* 📅 DATE */}
                        <Form.Item
                            {...restField}
                            name={[name, 'date']}
                            rules={[{ required: true, message: 'Pilih tanggal!' }]}
                        >
                            <DatePicker showTime />
                        </Form.Item>

                        {/* ❌ DELETE */}
                        <Form.Item><DeleteOutlined onClick={() => remove(name)} /></Form.Item>
                        </Space>
                    ))}

                    {/* ➕ ADD BUTTON */}
                    <Form.Item>
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                        Tambah Tracking
                        </Button>
                    </Form.Item>
                    </>
                )}
                </Form.List>


                <Form.Item className="mt-2">
                        <Button type="link" href="/transaction/retur" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>
            
           <style jsx>{`
                :global(.avatar-uploader .ant-upload) {
                    width: 50px !important;
                    height: 50px !important;
                }
            `}</style>
        </DashboardLayout>
    );
}


export default AddRetur;