import { Form, Input, Button, Select, message, Space } from 'antd';
import axiosInstance from '@/utils/axiosInstance';
import { useState, useEffect } from 'react';
import { Location, LocationInput } from '@/type/location';
import {
  ReloadOutlined,
} from '@ant-design/icons';

const { Option } = Select;

interface LocationFormProps {
  onSuccess: (newLocation: Location) => void;
  data: Location | null,
  onReload: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onSuccess, data, onReload }) => {
  const [parentLocations, setParentLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  
  const getDataParents = () => {
    setLoading(true);
    axiosInstance
      .get('/location')
      .then((response) => {
        setParentLocations(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(error.message);
      });

      
  }

  useEffect(() => {
   

    getDataParents();

  }, []);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({name: data.name, parent_id: data.parent_id});
    }
  }, [data]);

  const onFinish = (values: LocationInput) => {
    const inputData: LocationInput = {
      parent_id: values.parent_id || null,
      name: values.name,
    };

    if(data != null){
      inputData.location_id = data.location_id;
    }

    axiosInstance
      .post('/location', inputData)
      .then((response) => {
        message.success('Gudang berhasil ditambahkan!');
        onSuccess(response.data.data);
        form.resetFields();
        getDataParents();
      })
      .catch((error) => {
        message.error(error.message);
      });
  };

  const reloadPage = () => {
    getDataParents();
    return onReload;
  }
  

  return (
    <Form onFinish={onFinish} form={form} layout="vertical">
      <Form.Item name="name" label="Nama Gudang" rules={[{ required: true, message: 'Nama gudang harus diisi' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="parent_id" label="Parent Gudang" initialValue={null}>
        <Select allowClear>
          {parentLocations.map((location) => (
            <Option key={location.location_id} value={location.location_id}>
              {location.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Simpan
          </Button>
          <Button type="default" loading={loading} icon={<ReloadOutlined/>} onClick={reloadPage}>
            Reload
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default LocationForm;
