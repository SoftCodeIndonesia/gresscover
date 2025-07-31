import React, { useEffect, useState } from 'react';
import { message, Tabs, TabsProps } from 'antd';
import DashboardLayout from "../component/DashboardLayout"
import StaffInformation from '../component/StaffInformation';
import HakAkses from '../component/HakAkses';
import { Staff } from '@/type/staff';
import axiosInstance from '@/utils/axiosInstance';
import { User } from '@/type/user';
import { getCookie } from 'cookies-next';
import UserInformation from '../component/UserInformation';
import ChangePassword from '../component/ChangePassword';

const Account = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingState, setLoading] = useState<boolean>(false);
    const [items, setItem] = useState<TabsProps['items']>([
        {
          key: '1',
          label: 'Profile',
          children: <UserInformation data={null}/>,
        },
        // {
        //   key: '2',
        //   label: 'Hak Akses',
        //   children: <HakAkses id={0} permissions={[]}/>,
        // },
        {
          key: '3',
          label: 'Ganti Kata Sandi',
          children: <ChangePassword/>,
        },
    ]);

    const userCookie = getCookie('user');


    const details = async () => {
        
        setLoading(true);

        const dataUser = JSON.parse(`${userCookie}`);
      
        try {
            const response = await axiosInstance.get(`/profile/${dataUser?.id}`);
            if(response.status == 200){
                const user = response.data.data;
                console.log(user);
                setUser(user);
                setItem([
                    {
                      key: '1',
                      label: 'Data User',
                      children: <UserInformation data={user}/>,
                    },
                    // {
                    //   key: '2',
                    //   label: 'Hak Akses',
                    //   children: <HakAkses id={user.id} permissions={user.permissions} />,
                    // },
                    {
                        key: '3',
                        label: 'Ganti Kata Sandi',
                        children: <ChangePassword/>,
                    },
                ]);
            }
        } catch (error) {
            console.log('response', error);
            message.error("Gagal Mendapatkan Informasi Staff");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        setUser(JSON.parse(`${userCookie}`));
    }, []);
    useEffect(() => {
        details();
    }, []);

    return (
        <DashboardLayout>
            <Tabs defaultActiveKey="1" items={items}/>
        </DashboardLayout>
    );
}

export default Account;