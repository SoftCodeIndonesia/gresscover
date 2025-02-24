import React, { useEffect, useState } from 'react';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ExclamationCircleFilled,
  FileDoneOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, MenuProps, Modal, Spin, theme } from 'antd';

import { User } from '@/type/user';
import { deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

type Props = {
    children: React.ReactNode;
};

type MenuItem = Required<MenuProps>['items'][number];


const { confirm } = Modal;

const DashboardLayout: React.FC<Props> = ({children}) => {
    const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

  const [user, setUser] = useState<User | null>(null);
  const [currentKey, setCurrentKey] = useState<string>();
  const userCookie = getCookie('user');
  const router = useRouter();
  const [modal, contextHolder] = Modal.useModal();

  const navigateTo = (path: string, key: string) => {
    setCurrentKey(key);
    console.log(key)
    router.push(path);
  }

  useEffect(() => {
    console.log(currentKey)
    console.log(router);
    setUser(JSON.parse(`${userCookie}`));
  }, []);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Link href="/account">
          Account
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      key: '2',
      className: 'text-red-600',
      label: (
        <Link href='#' className='text-red-600' rel="noopener noreferrer" onClick={ async (e) => loggedOut(e)}>
          Keluar
        </Link>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  const loggedOut = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    confirm({
      title: 'Keluar',
      icon: <ExclamationCircleFilled />,
      content: 'Yakin Ingin Keluar?',
      onOk() {
        deleteCookie('user');
        deleteCookie('token');

        window.location.href = '/login';
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const menus: MenuItem[] = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '10',
      icon: <PieChartOutlined />,
      label: 'Inventory',
      
      children: [
        { key: '10.1', label: <Link href="/inventory">Semua Barang</Link>,  },
        { key: '10.2', label: <Link href="/inventory/mutasi">Mutasi</Link>,  },
        { key: '10.3', label: <Link href="/inventory/in">Barang Masuk</Link>,  },
        { key: '10.4', label: <Link href="/inventory/out">Barang Keluar</Link>,  },
      ],
    },
    {
      key: '7',
      icon: <FileDoneOutlined />,
      label: 'Transaksi',
      children: [
        { key: '7.1', label:<Link href="/transaction">Semua Transaksi</Link>},
        { key: '7.2', label:<Link href="/transaction/penjualan">Transaksi Penjualan</Link>},
        { key: '7.3', label:<Link href="/transaction/retur">Transaksi Retur</Link>},
        { key: '7.4', label:<Link href="/transaction/change">Penukaran Barang</Link>},
      ],
    },
    {
      key: '2',
      icon: <DatabaseOutlined />,
      label: 'Master',
      children: [
        { key: '2.1', label: <Link href="/items">Semua Item</Link> },
        { key: '2.2', label: <Link href="/category">Kategori</Link> },
        { key: '3.4', label: <Link href="/warehouse">Gudang</Link> },
      ],
    },
    {
      key: '6',
      icon: <UserSwitchOutlined />,
      label: 'Mejemen User',
      children: [
        { key: '6.1', label: <Link href="/staff">User</Link>},
        { key: '6.2', label: <Link href="/hak_akses">Managemen Hak Akses</Link>},
      ],
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={'20%'}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[currentKey!]}
          items={menus}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} className='flex items-center justify-between'>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Dropdown menu={{ items }}>
            <div className='flex items-center gap-3 pr-5'>
              
              <Avatar size={'large'} src={<img src={`${user?.photo == null ? '' : process.env.NEXT_PUBLIC_BE + '/storage/' + user.photo}`} alt="avatar" />} icon={<UserOutlined />}  />
              <span className='text-sm '>{user?.name}</span>
            </div>
          </Dropdown>
          
          
        </Header>
        <Content
          style={{
            margin: '16px 16px',
            padding: 24,
            minHeight: 280,
            // background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;

