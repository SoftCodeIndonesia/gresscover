import { useEffect, useState } from "react";
import { Item } from "@/type/item";
import { Location } from "@/type/location";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { Image,Button, Divider, Form, Input, message, Select, Space, Table, Modal, Checkbox, AutoComplete, AutoCompleteProps } from "antd";
import { LayoutType } from "@/type/form.layout";

import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Inventory } from "@/type/inventory";
import Title from "antd/es/typography/Title";

interface TableInventory {
    key: string, 
    product_name: string|null, 
    product_id: string|null, 
    stok: number|null, 
    sku: string|null, 
    selling_price: number|null, 
    cost: number|null, 
    minimum: number|null,
}


const addInventory = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [itemsSelected, setItemSelected] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [locations, setLocations] = useState<Location[]>([]);
    const [location, setLocationName] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [stok, setStok] = useState<number>(0);
    const [initialTable, setInitialTable] = useState<TableInventory[]>(Array.from({ length: 4 }, (_, index) => ({
        key: `parent_${index}`, 
        product_name: null, 
        product_id: null, 
        stok: 0.0, 
        sku: null, 
        selling_price: 0.0, 
        cost: 0.0, minimum: 1,
    })));

    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

    const [minimum, setMinimum] = useState<number>(0);

    const [form] = Form.useForm();
     

    const columns = [
        {
            title: "Nama",
            dataIndex: "nama",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "nama"]}
                    rules={[{ required: true, message: "Product tidak boleh kosong" }]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Cari/Masukan Product" />
                </Form.Item>
            ),
        },
        {
            title: "SKU",
            dataIndex: "sku",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "sku"]}
                    rules={[{ required: true, message: "SKU tidak boleh kosong" }]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Masukan SKU Product" />
                </Form.Item>
            ),
        },
        {
            title: "STOK",
            dataIndex: "stok",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "stok"]}
                    rules={[{ required: true, message: "Stok tidak boleh kosong",min: 1 }]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Masukan stok" />
                </Form.Item>
            ),
        },
        {
            title: "COST",
            dataIndex: "cost",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "cost"]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Masukan COST" />
                </Form.Item>
            ),
        },
        {
            title: "Harga Jual",
            dataIndex: "selling_price",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "selling_price"]}
                    rules={[{ required: true, message: "Harga Jual tidak boleh kosong" }]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Masukan Harga Jual" />
                </Form.Item>
            ),
        },
        {
            title: "Minimum Stok",
            dataIndex: "minimum",
            render: (_: any, record: TableInventory, index: number) => (
                <Form.Item
                    name={["data", index, "minimum"]}
                    rules={[{ min: 1,}]}
                    style={{ margin: 0 }}
                    >
                    <Input placeholder="Minimum" />
                </Form.Item>
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

    const columnsListItem = [
       
        {
            title: 'Photo',
            dataIndex:'photo', 
            key: 'photo',
            render: (_: any, record: Item) => record.photo != null ? <Image
                width={40}
                src={`${process.env.NEXT_PUBLIC_BE}/storage/${record.photo}`}
                fallback="data:image/png;base64,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"
            /> : '',
        },
        {
            title: 'Nama item',
            dataIndex:'name', 
            key: 'name',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Harga Beli',
            dataIndex: 'cost',
            key: 'cost',
            render: (_:any, record: Item) => formatRupiah(parseFloat(record.cost)),
        },
        {
            title: 'Pilih',
            dataIndex: '',
            key: '',
            render: (_:any, record: Item) => <Checkbox value={record} checked={checkOnSelected(record)} onChange={handleCheckboxChange}/>
        },
    ];

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

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/items');
            if(response.status == 200){
                setItems(response.data.data);
            }else{
                message.error(response.data.message);
            }
        } catch (error) {
            message.error(`${error}`);
        } finally {
            setLoading(false);
        }
    }

    const fetchLocation = async (search: string) => {
        try {
            const response = await axiosInstance.get(`/location?name=${search}`);
            if(response.status == 200){
                const locationResult: Location[] = response.data.data;
                
                if(locationResult.length > 0){
                    const result = locationResult.map((data: Location) => {
                        return {
                            value: data.location_id,
                            label: data.name,
                        }
                    })
                    setOptions(result);
                }else{
                    setOptions([
                        {
                            value: '1',
                            label: (<Button type="text">{`Tambahkan ${search}`}</Button>),
                        }
                    ]);
                }

            }
        } catch (error) {
            message.error(`${error}`);
            
        }
    }
    
    const addLocation = async () => {
        try {
            const response = await axiosInstance.post('/location', {'name': location});
            if(response.status == 200){
                form.setFieldValue('location_id', response.data.data.location_id);
            }
        } catch (error) {
            message.error(`${error}`);
        }
    }

    const handleSubmit = async () => {
        console.log(itemsSelected);
    }

    const applyBulkChange = async () => {

        var newData = itemsSelected.map((obj) => {return { ...obj, minimum_stock: minimum, price: price, quantity: stok }})
        console.log(newData);
        setItemSelected(newData);
    }


    const onSelect = (value: string) => {
        console.log('onSelect', value);
    };
    

    

    useEffect(() => {
        fetchItems();
        
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

                <Form.Item name="location_name" className="w-full" label="Tambahkan Lokasi">
                    <AutoComplete
                        options={options}
                        style={{ width: 200 }}
                        onSelect={onSelect}
                        onSearch={fetchLocation}
                        placeholder="Cari/Pilih Gudang"
                    />
                </Form.Item>
                <Table 
                    columns={columns} 
                    loading={loading} 
                    rowKey={(record) => record.key ?? ''} 
                    pagination={false} 
                    dataSource={initialTable} 
                />
            </Form>
            
            
            <div className="flex py-3 justify-between items-center">
                <div className="flex gap-3">
                    <Button type="primary" onClick={() => setModal(true)}>Pilih Item</Button>
                    <Button type="primary" className="bg-green-600 hover:bg-green-600" onClick={handleSubmit}>Simpan</Button>
                </div>
                <Space className="flex justify-end">
                    <p className="text-sm">Atur Sekaligus</p>
                    <Input placeholder="Harga" onChange={(e) => setPrice(parseInt(e.target.value))}></Input>
                    <Input placeholder="Stok" onChange={(e) => setStok(parseInt(e.target.value))}></Input>
                    <Input placeholder="Minimum" onChange={(e) => setMinimum(parseInt(e.target.value))}></Input>
                    <Button type="primary" onClick={applyBulkChange}>Terapkan</Button>
                </Space>
            </div>
            
            

            <Modal
                title="Tambah Inventory"
                visible={modal}
                onCancel={(e) => setModal(false)}
                footer={null}
            >
                <Table columns={columnsListItem} rowKey={(record) => record.product_id} dataSource={items} />
            </Modal>    
        </DashboardLayout>
    );
}


export default addInventory;