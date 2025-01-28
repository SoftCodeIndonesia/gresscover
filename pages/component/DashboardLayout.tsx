import React, { createContext, useEffect, useState } from 'react';
import {
  DatabaseOutlined,
  ExclamationCircleFilled,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UploadOutlined,
  UserOutlined,
  UserSwitchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, MenuProps, Modal, Spin, theme } from 'antd';
import Link from 'antd/es/typography/Link';
import { User } from '@/type/user';
import { deleteCookie, getCookie } from 'cookies-next';

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
  const userCookie = getCookie('user');

  const [modal, contextHolder] = Modal.useModal();

  

  useEffect(() => {
    console.log(userCookie);
    setUser(JSON.parse(`${userCookie}`));
  }, []);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a href="/account">
          Account
        </a>
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

  const loggedOut = (e: any) => {
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
      icon: <PieChartOutlined />,
      label: 'Dashboard',
    },
    {
      key: '10',
      icon: <PieChartOutlined />,
      label: <Link href="/inventory">Inventory</Link>,
    },
    {
      key: '2',
      icon: <DatabaseOutlined />,
      label: 'Master',
      children: [
        { key: '3', label: <Link href="/items">Item</Link>,  },
        { key: '4', label: <Link href="/category">Kategori</Link>,  },
        { key: '5', label: <Link href="/supplier">Daftar Pemasok</Link>,  },
        { key: '9', label: <Link href="/warehouse">Daftar Gudang</Link>,  },
      ],
    },
    {
      key: '6',
      icon: <UserSwitchOutlined />,
      label: 'Mejemen Staff',
      children: [
        { key: '7', label: <Link href="/staff">Daftar Staff</Link>,  },
        { key: '8', label: <Link href="/hak_akses">Hak Akses</Link>,  },
      ],
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
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
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
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

