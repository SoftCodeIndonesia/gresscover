import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import DashboardLayout from '@/pages/component/DashboardLayout';
import MovementOutContent from './components/MovementOut';
import MovementItemContent from '../in/components/InventoryInItem';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Barang Keluar',
    children: <MovementOutContent />,
  },
  {
    key: '2',
    label: 'Item Barang Keluar',
    children: <MovementItemContent type={['out']}/>,
  },
];

const MovementOut: React.FC = () => {
    return (
        <DashboardLayout>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </DashboardLayout>
    )
}

export default MovementOut;