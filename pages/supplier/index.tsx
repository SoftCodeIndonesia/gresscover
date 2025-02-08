import { useState, useEffect } from 'react';
import { Table, Input, Button, Modal, Form, Popconfirm, message } from 'antd';
import { DeleteFilled, EditFilled, PlusCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Supplier } from '@/type/supplier';
import axios from 'axios'; // Untuk melakukan request fetch ke API server
import DashboardLayout from '../component/DashboardLayout';
import axiosInstance from '@/utils/axiosInstance';
import { FormLayout } from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import { DeleteButton, EditButton } from '../component/ButtonComponent';

const SupplierPage = () => {
  // State untuk daftar supplier dan untuk modal form
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formLayout] = useState<FormLayout>('vertical');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null); // Untuk menangani Edit
  const [form] = Form.useForm(); // Form instance

  // Fetch data suppliers dari API
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/supplier'); // Ganti dengan URL API yang sesuai
      if(response.status == 200){
        setSuppliers(response.data.data);
      }
    } catch (error) {
      message.error('Gagal mengambil data supplier');
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchSuppliers saat komponen dimount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Untuk menangani pencarian
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Aksi untuk menambah atau mengedit supplier
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingSupplier) {
        values = {...values, supplier_id: editingSupplier.supplier_id};
      } 

      
     const response = await axiosInstance.post('/supplier', values);


      if(response.status === 200){
        message.success('Berhasil di submit!');
        fetchSuppliers(); // Setelah berhasil, refresh data supplier
        setIsModalVisible(false);
      }else{
        message.error('Gagal Submit Data');
      }

    } catch (error) {
      message.error(`Gagal menyimpan data supplier => ${error}`);
    }finally {
      setLoading(false);
    }
  };

  // Untuk menghapus supplier
  const handleDelete = async (supplierId: string) => {
    try {
      await axiosInstance.delete(`/supplier/${supplierId}`);
      message.success('Supplier berhasil dihapus');
      fetchSuppliers(); // Refresh daftar setelah hapus
    } catch (error) {
      message.error('Gagal menghapus supplier');
    }
  };

  // Untuk membuka modal tambah atau edit
  const showModal = (supplier?: Supplier) => {
    
    if (supplier != null) {
      console.log('masuk');
      setEditingSupplier(supplier); // Set supplier yang akan di-edit
      form.setFieldsValue(supplier); // Isi form dengan data supplier yang akan diedit
    } else {
      console.log('masuk else');
      setEditingSupplier(null); // Reset untuk tambah baru
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const cancelModal = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(false);
  }

  // Kolom tabel
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact Name', dataIndex: 'contact_name', key: 'contact_name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, supplier: Supplier) => (
        <>
          <EditButton label='Edit'  onClick={() => showModal(supplier)}/>
          <DeleteButton label='Hapus' onComfirm={() => handleDelete(supplier.supplier_id)} okText='Hapus' cancelText='Batal' />
        </>
      ),
    },
  ];

  // Filter data berdasarkan searchText
  const filteredSuppliers = suppliers.filter((supplier) => {
    return (
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.contact_name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(searchText.toLowerCase()) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name, contact, email, phone, or address"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300, marginRight: 8 }}
          prefix={<SearchOutlined />}
        />
        <Button onClick={() => showModal()} icon={<PlusCircleOutlined/>} type="primary" style={{ marginRight: 8 }}>
          Buat Baru
        </Button>
        <Button onClick={fetchSuppliers} loading={loading} icon={<ReloadOutlined/>} type="default">
          Refresh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSuppliers}
        rowKey="supplier_id"
        loading={loading}
        
      />

      {/* Modal untuk Add/Edit Supplier */}
      <Modal
        title={editingSupplier ? 'Edit Supplier' : 'Buat Supplier Baru'}
        visible={isModalVisible}
        onCancel={cancelModal}
        footer={null}
      >
        <Form
            form={form}
            onFinish={handleSubmit}
            
            //   initialValues={{ layout: formLayout }}
            style={{ maxWidth: '100%' }}
            layout={formLayout}

        >
          <Form.Item
            label="Nama Supplier"
            name="name"
            rules={[{ required: true, message: 'Please input the supplier name!' }]}
          >
            <Input placeholder='Masukan Nama Supplier' />
          </Form.Item>
          <Form.Item
            label="Nama Kontak"
            name="contact_name"
            rules={[{ required: true, message: 'Please input the contact name!' }]}
          >
            <Input placeholder='Masukan Nama Kontak' />
          </Form.Item>
          <Form.Item
            label="Nomor Telepon"
            name="phone"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
          >
            <Input placeholder='6288282827362' />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input the email!' }, { type: 'email', message: 'Invalid email' }]}
          >
            <Input placeholder='example@gmail.com' />
          </Form.Item>
          <Form.Item
            label="Address"
            name="address"
          >
            <TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Kirim
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export default SupplierPage;
