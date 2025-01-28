"use client"

import React, { useEffect, useState } from 'react';
import { message, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import DashboardLayout from '@/pages/component/DashboardLayout';
import { Staff } from '@/type/staff';
import StaffInformation from '@/pages/component/StaffInformation';
import HakAkses from '@/pages/component/HakAkses';
import { useParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { useRouter } from 'next/router';


const onChange = (key: string) => {
  console.log(key);
};



const DetailStaff = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loadingState, setLoading] = useState<boolean>(false);
    const [items, setItem] = useState<TabsProps['items']>([
        {
          key: '1',
          label: 'Data Staff',
          children: <StaffInformation data={null}/>,
        },
        {
          key: '2',
          label: 'Hak Akses',
          children: <HakAkses id={0} permissions={[]}/>,
        },
    ]);

    
    const router = useRouter();

    const details = async () => {
        
        setLoading(true);
      
        try {
            var response = await axiosInstance.get(`/staff/${slug}`);
            if(response.status == 200){
                const staffData = response.data.data;
                setStaff(staffData);
                setItem([
                    {
                      key: '1',
                      label: 'Data Staff',
                      children: <StaffInformation data={staffData}/>,
                    },
                    {
                      key: '2',
                      label: 'Hak Akses',
                      children: <HakAkses id={staffData.user.id} permissions={staffData.user.permissions} />,
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
        if (router.isReady) {
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        if(slug){
            details();
        }
    }, [slug]);

    return (
        <DashboardLayout>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </DashboardLayout>
    )
}

export default DetailStaff;