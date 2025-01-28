import { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import DashboardLayout from '../component/DashboardLayout';
import LocationForm from './location_form';
import axiosInstance from '../../utils/axiosInstance';
import { Location } from '@/type/location';
import Title from 'antd/es/typography/Title';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import cookie from 'cookie';
import { DeleteButton, EditButton } from '../component/ButtonComponent';

interface LocationsPageProps {
  initialLocations: Location[];
}

const LocationsPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [editData, setEditData] = useState<Location|null>(null);

  const handleAddLocation = (newLocation: Location) => {
    setEditData(null);
    getLocations();
  };

  const handleDeleteLocation = (locationId: string) => {
    axiosInstance
      .delete(`/location/${locationId}`)
      .then(() => {
        setLocations(locations.filter((loc) => loc.location_id !== locationId));
        message.success('Gudang berhasil dihapus!');
      })
      .catch((error) => {
        message.error(error.message);
      });
  };

  const handleEdit = async (dataEdit: Location) => {
    setLoadingEdit(true);
    setEditData(dataEdit);
    setLoadingEdit(false);
  }

  const columns = [
    {
      title: 'Nama Gudang',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, location: Location) => (
        <>
          <EditButton label='Edit'  onClick={() => handleEdit(location)}/>
          <DeleteButton label='Hapus' onComfirm={() => handleDeleteLocation(location.location_id)} okText='Hapus' cancelText='Batal' />
        </>
      ),
    },
  ];


  


  const getLocations = async () => {
    setLoading(true);
    try {
      var response = await axiosInstance.get('/location');
      setLocations(response.data.data);
    } catch (error: any) {
      message.error(`${error.response.data.message}`);
    }finally {
      setLoading(false);
    }
  }

  const onRelaod = () => {
    console.log('ok');
    getLocations();
  }

  useEffect(() => {
    getLocations();
  }, []);

  return (
    <DashboardLayout>
      <Title level={4}>Daftar Gudang</Title>
      <LocationForm onSuccess={handleAddLocation} data={editData} onReload={onRelaod} />
      <Table columns={columns} dataSource={locations} loading={loading} rowKey="location_id" style={{ marginTop: 20 }} />
    </DashboardLayout>
  );
};


export default LocationsPage;

// // SSR untuk mendapatkan data awal lokasi
// export async function getServerSideProps(context: any) {

//   const { token } = cookie.parse(context.req.headers.cookie || '');


//   // console.log(req.headers.cookie);
  
//   // Ambil token dari cookie
//   // const token = cookies
//   //   .split('; ')
//   //   .find((row: string) => row.startsWith('token='))
//   //   ?.split('=')[1];
  
//   const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URI}/location`, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//   });

//   // console.log(response);
    
//   return {
//     props: {
//       locations: response.data.data,
//       token: token,
//     },
//   };
// }
