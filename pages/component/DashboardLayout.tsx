import React, { useEffect, useState } from 'react';
import {
  CalculatorOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExclamationCircleFilled,
  FileDoneOutlined,
  FileProtectOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PercentageOutlined,
  PieChartOutlined,
  SettingOutlined,
  ShopOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, MenuProps, message, Modal, Spin, theme } from 'antd';

import { User } from '@/type/user';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { MenuSide } from '@/type/menu';
import axiosInstance from '@/utils/axiosInstance';

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
  const [currentKey, setCurrentKey] = useState<string[]>(['2', '2.1']);
  const userCookie = getCookie('user');
  const router = useRouter();
  const [modal, contextHolder] = Modal.useModal();
  const [menu_item, setMenuItem] = useState<MenuSide>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const setKeyMenu = (keys: string[]) => {
    setCookie('menu', keys);
  }

  const getKeys = () => {
    const menukey = getCookie('menu');
    const keys = menukey == undefined ? ['1'] : JSON.parse(menukey!);
    // console.log(keys);
    // setCurrentKey(keys);
    return keys;
  }

  const getMenus = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/menus');
      if(response.status == 200){
        console.log(response.data.data.data);
        setMenuItem(response.data.data.data);
      }
    } catch (error: any) {
      message.error(`${error?.response?.data?.message ?? error}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    
    setUser(JSON.parse(`${userCookie}`));
    getMenus();
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

  const iconMap: Record<string, JSX.Element> = {
    DashboardOutlined: <DashboardOutlined />,
    PieChartOutlined: <PieChartOutlined />,
    FileDoneOutlined: <FileDoneOutlined />,
    FileProtectOutlined: <FileProtectOutlined />,
    DatabaseOutlined: <DatabaseOutlined />,
    UserSwitchOutlined: <UserSwitchOutlined />,
    CalculatorOutlined: <CalculatorOutlined />,
    ShopOutlined: <ShopOutlined />,
    PercentageOutlined: <PercentageOutlined />,
    SettingOutlined: <SettingOutlined />,
};



  const menus: MenuItem[] = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard" onClick={() => setKeyMenu(['1'])} >Dashboard</Link>,
    },
    {
      key: '2',
      icon: <PieChartOutlined />,
      label: 'Inventory',
      
      children: [
        { key: '2.1', label: <Link href="/inventory" onClick={() => setKeyMenu(['2', '2.1'])}>Semua Barang</Link>,  },
        { key: '2.2', label: <Link href="/inventory/mutasi" onClick={() => setKeyMenu(['2', '2.2'])}>Mutasi</Link>,  },
        { key: '2.3', label: <Link href="/inventory/in" onClick={() => setKeyMenu(['2', '2.2'])}>Barang Masuk</Link>,  },
        { key: '2.4', label: <Link href="/inventory/out" onClick={() => setKeyMenu(['2', '2.4'])}>Barang Keluar</Link>,  },
      ],
    },
    {
      key: '3',
      icon: <FileDoneOutlined />,
      label: 'Transaksi',
      children: [
        { key: '3.1', label:<Link href="/transaction" onClick={() => setKeyMenu(['3', '3.1'])}>Semua Transaksi</Link>},
        { key: '3.2', label:<Link href="/transaction/penjualan" onClick={() => setKeyMenu(['3', '3.2'])}>Transaksi Penjualan</Link>},
        { key: '3.3', label:<Link href="/transaction/retur" onClick={() => setKeyMenu(['3', '3.3'])}>Transaksi Retur</Link>},
        { key: '3.4', label:<Link href="/transaction/change" onClick={() => setKeyMenu(['3', '3.4'])}>Penukaran Barang</Link>},
      ],
    },
    {
      key: '4',
      icon: <FileProtectOutlined />,
      label: <Link href="/report" onClick={() => setKeyMenu(['4'])}>Laporan</Link>
    },
    {
      key: '5',
      icon: <DatabaseOutlined />,
      label: 'Master',
      children: [
        { key: '5.1', label: <Link href="/items" onClick={() => setKeyMenu(['5', '5.1'])}>Semua Item</Link> },
        { key: '5.2', label: <Link href="/category" onClick={() => setKeyMenu(['5', '5.2'])}>Kategori</Link> },
        { key: '5.3', label: <Link href="/warehouse" onClick={() => setKeyMenu(['5', '5.3'])}>Gudang</Link> },
        { key: '5.4', label: <Link href="/vendor" onClick={() => setKeyMenu(['5', '5.4'])}>Vendor</Link> },
      ],
    },
    {
      key: '6',
      icon: <UserSwitchOutlined />,
      label: 'Mejemen User',
      children: [
        { key: '6.1', label: <Link href="/staff" onClick={() => setKeyMenu(['6', '6.1'])}>User</Link>},
        { key: '6.2', label: <Link href="/hak_akses" onClick={() => setKeyMenu(['6', '6.2'])}>Managemen Hak Akses</Link>},
      ],
    },
    {
      key: '7',
      icon: <CalculatorOutlined />,
      label: <Link href="/tax" onClick={() => setKeyMenu(['7'])}>Daftar Potongan</Link>,
     
    },
    {
      key: '8',
      icon: <ShopOutlined />,
      label: <Link href="/platform" onClick={() => setKeyMenu(['8'])}>Platform Penjualan</Link>,
     
    },
    {
      key: '9',
      icon: <PercentageOutlined />,
      label: <Link href="/unit_converter" onClick={() => setKeyMenu(['9'])}>Konversi Satuan</Link>,
      
    },
    {
      key: '10',
      icon: <SettingOutlined />,
      label: <Link href="/settings" onClick={() => setKeyMenu(['10'])}>Pengaturan</Link>,
    },
    
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={'20%'} style={{ background: colorBgContainer }}>
        <div className="demo-logo-vertical" />
        <Menu
          
          mode="inline"
          defaultSelectedKeys={getKeys()}
          items={menu_item.map((value) => {
            return {
              key: value.key,
              icon: value.icon ? iconMap[value.icon] : null,
              label: value.children.length == 0 ? <Link href={value.route} onClick={() => setKeyMenu([value.key])}>{value.name}</Link> : value.name,
              
              children: value.children.length > 0 ? value.children.map((child) => {
                return { key: child.key, label: <Link href={child.route} onClick={() => setKeyMenu([value.key, child.key])}>{child.name}</Link>,  }
              }) : null,
            }
          
          })}
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
              
              <Avatar size={'large'} src={<img src={`${user?.photo == null ? 'data:image/png;base64,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' : process.env.NEXT_PUBLIC_API_URI + '/storage/' + user.photo}`} alt="avatar" />} icon={<UserOutlined />}  />
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

