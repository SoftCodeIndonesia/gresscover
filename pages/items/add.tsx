import { Button, Form, Input, Radio, Image, Space, Upload, UploadFile, GetProp, UploadProps, message, Select, Avatar, Spin, Divider, InputRef, AutoComplete, AutoCompleteProps } from "antd";
import DashboardLayout from "../component/DashboardLayout";
import Title from "antd/es/typography/Title";
import { useEffect, useRef, useState } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { Category } from "@/type/category";
import SomethingWrong from "../component/500";
import axiosInstance from "@/utils/axiosInstance";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { Item, ItemUnit } from "@/type/item";
import { Location } from "@/type/location";

type LayoutType = Parameters<typeof Form>[0]['layout'];

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
});

const AddItem = () => {
    const [errorPage, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [formLayout, setFormLayout] = useState<LayoutType>('vertical');
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<ItemUnit[]>([]);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [categoryNewName, setName] = useState('');
    const [unit_name, setUnitname] = useState('');
    
    const inputRef = useRef<InputRef>(null);

    const [item_id, setItemId] = useState<string|null>();

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        const data = newFileList[newFileList.length - 1];
        setFileList([data]);
    };

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const fetchCategories = async() => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/category');
            setCategories(response.data.data);
        } catch (error) {
            setError(true);
            message.error("Gagal Mengambil Data Kategori!");
        } finally {
            setLoading(false);
        }
    }
    const fetchUnits = async() => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/units');
            setUnits(response.data.data);
        } catch (error) {
            setError(true);
            message.error("Gagal Mengambil Data Units!");
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('barcode', values.barcode ?? null);
        formData.append('category_id', values.category_id ?? null);
        formData.append('cost', values.cost);
        formData.append('price', values.price);
        formData.append('sku', values.sku);
        formData.append('min_quantity', values.min_quantity);
        formData.append('unit_id', values.unit_id);
        formData.append('unit_name', units.filter((value: ItemUnit) =>value.type_id == values.unit_id)[0].name);
        formData.append('quantity', values.quantity);
        formData.append('location', values.location);
        if(fileList.length > 0){
            formData.append('photo', fileList[0].originFileObj as Blob);
        }
        const id = getCookie('item_id');
        if(id != null){
            formData.append('item_id', id);
        }

        setLoading(true)
        try {
            
            const response = await axiosInstance.post("/items", formData, {
                headers: {
                    "Content-Type": 'multipart/form-data',
                }
            });

            if(response.status == 200){
                deleteCookie('item_id')
                message.success("Berhasil Menambahkan Item");
                window.location.href = '/items';
            }else{
                message.error("Gagal Menambahkan Item");
            }

        } catch (error) {
            message.error("Gagal Menambahkan Item");
        } finally {
            setLoading(false);
        }

    }

    const fetchItemEdit = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/items/${item_id}`);
            if(response.status == 200){
                const data = response.data.data as Item;
                form.setFieldsValue({
                    'name': data.name,
                    'barcode': data.barcode,
                    'category_id': data.category_id,
                    'cost': parseInt(data.cost),
                    'sku': data.sku,
                    'min_quantity': data.min_stock_quantity,
                    'photo': data.photo,
                    'unit_id': data.unit_id,
                    'unit_name': data.unit_name,
                });
            }
        } catch (error) {
            message.error("Gagal Mengambil Data Item!");
        } finally {
            setLoading(false);
        }
    }

    const submitNewCategory = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        setLoading(true);


        try {
            const response = await axiosInstance.post('/category', {name: categoryNewName});
            if(response.status == 200){
                message.success("Berhasil!");
                setName('');
                form.setFieldValue('category_id', response.data.data.category_id);
                setCategories([...categories, response.data.data]);
            }
        } catch (error) {
            message.error(`Gagal Menambahkan Kategori Baru! => ${error}`);
        } finally {
            setLoading(false);
        }


    }

    const submitNewUnit = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        setLoading(true);


        try {
            const response = await axiosInstance.post('/units', {name: unit_name});
            if(response.status == 200){
                message.success("Berhasil!");
                setUnitname('');
                form.setFieldValue('unit_id', response.data.data.type_id);
                setUnits([...units, response.data.data]);
            }
        } catch (error) {
            message.error(`Gagal Menambahkan Satuan Baru! => ${error}`);
        } finally {
            setLoading(false);
        }


    }
    
    const fetchLocation = async (search: string,callback: (data: { value: string; label: string }[]) => void) => {
        try {
            const response = await axiosInstance.get(`/location?name=${search}`);
            if(response.status == 200){
                const locationResult: Location[] = response.data.data;
                
                if(locationResult.length > 0){
                    const result = locationResult.map((location: Location) => {
                        return {
                            value: location.location_id,
                            label: location.name,
                            object: location,
                        }
                    })
                    callback(result);
                }else{
                    callback([
                        {
                            value: `${search}`,
                            label: `${search}`,
                        }
                    ]);
                }

            }
        } catch (error) {
            message.error(`${error}`);
            
        }
    }

    const onSelectLocation = (value: string, object: any) => {
        console.log('value', value);
        console.log('object', object);
        form.setFieldsValue({
            'location': value,
        })
    }

    useEffect(() => {
        const id = getCookie('item_id');
        if(id != null){
            fetchItemEdit();
        }
    })

    useEffect(() => {
        fetchUnits();
        fetchCategories();
    }, [])

    useEffect(() => {
        const item_id = getCookie('item_id');
        if(item_id != null){
            setItemId(item_id);
            form.setFieldValue('quantity', 1)
        }
    },[])


    
    return (
        <DashboardLayout>
            {errorPage ? <SomethingWrong/> : <div>

            <Title level={2}>Buat Item Baru</Title>
            <Form
                layout={formLayout}
                form={form}
                initialValues={{ layout: formLayout }}
                style={{ maxWidth: '50%' }}
                className="flex flex-col"
                onFinish={handleSubmit}
                disabled={loading}
            >
                <div className="flex items-center justify-center gap-3">
                    {item_id != null && form.getFieldValue('photo') != undefined && fileList.length == 0 && <Image
                            width={100}
                            fallback="data:image/png;base64,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"
                            src={`${process.env.NEXT_PUBLIC_BE}/storage/${form.getFieldValue('photo')}`}
                    />}
                    <Form.Item label="" className="flex">
                        
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                        >
                            {fileList.length >= 8 ? null : uploadButton}
                        </Upload>
                        
                        {previewImage && (
                            <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                            visible: previewOpen,
                            onVisibleChange: (visible) => setPreviewOpen(visible),
                            afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                            />
                        )}

                    </Form.Item>
                </div>
                    <Form.Item className="flex-1" label="Nama Item" name='name' rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]} >
                        <Input placeholder="Masukan nama item" />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Kategori" name="category_id">
                        <Select
                            showSearch
                            placeholder="Pilih Kategori"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  <Divider style={{ margin: '8px 0' }} />
                                  <Space style={{ padding: '0 8px 4px' }}>
                                    <Input
                                      placeholder="Masukan Kategori Baru"
                                      ref={inputRef}
                                      value={categoryNewName}
                                      onChange={onNameChange}
                                      onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <Button type="text" icon={<PlusOutlined />} onClick={submitNewCategory}>
                                      Submit
                                    </Button>
                                  </Space>
                                </>
                            )}
                            options={categories.map((data) => ({value: data.category_id, label: data.name}))}
                        />
                    </Form.Item>
                    <Form.Item className="flex-1" label="SKU" name="sku" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan SKU" />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Barcode" name="barcode">
                        <Input placeholder="Masukan Barcode" />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Harga Beli" name="cost" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Harga Beli" type="number" min={1} />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Harga Jual" name="price" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Harga Jual" type="number" />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Gudang" name="location" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Select
                            showSearch
                            className="w-full"
                            placeholder={'Cari/Tambahkan Gudang Baru'}
                            defaultActiveFirstOption={false}
                            suffixIcon={null}
                            filterOption={false}
                            onSearch={(value) => fetchLocation(value,setOptions)}
                            notFoundContent={null}
                            options={options}
                            onSelect={onSelectLocation}
                        />
                        
                    </Form.Item>
                    <Form.Item className="flex-1" label="Quantity" name="quantity" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Quantity" type="number" />
                    </Form.Item>
                    <Form.Item className="flex-1" label="Minimum Quantity" name="min_quantity" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Input placeholder="Masukan Minimum Quantity" type="number" />
                    </Form.Item>
                    <Form.Item className="flex-auto" label="Satuan" name="unit_id" rules={[{ required: true, message: 'Bagian ini tidak boleh kosong!' }]}>
                        <Select
                        
                            showSearch
                            placeholder="Pilih Satuan"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  <Divider style={{ margin: '8px 0' }} />
                                  <Space style={{ padding: '0 8px 4px' }}>
                                    <Input
                                      placeholder="Masukan Satuan Baru"
                                      ref={inputRef}
                                      value={unit_name}
                                      onChange={(e) => setUnitname(e.target.value)}
                                      onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <Button type="primary" icon={<PlusOutlined />} onClick={submitNewUnit}>
                                      Submit
                                    </Button>
                                  </Space>
                                </>
                            )}
                            options={units.map((data) => ({value: data.type_id, label: data.name}))}
                        />
                    </Form.Item>
                
                
                <Form.Item>
                        <Button type="link" href="/items" loading={loading} >Batal</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>
            </Form>

            </div> }
        </DashboardLayout>
    );   
}

export default AddItem;