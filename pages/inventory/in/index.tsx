import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import DashboardLayout from '@/pages/component/DashboardLayout';
import MovementInContent from './components/InventoryIn';
import MovementItemContent from './components/InventoryInItem';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Barang Masuk',
    children: <MovementInContent />,
  },
  {
    key: '2',
    label: 'Item Barang Masuk',
    children: <MovementItemContent type={['in']}/>,
  },
];

const MovementIn: React.FC = () => {
    return (
        <DashboardLayout>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </DashboardLayout>
    )
}

export default MovementIn;