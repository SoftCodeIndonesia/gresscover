import { Breadcrumb, Card, Form, List, message, Radio, Table, TableColumnsType, Tag, Tree, TreeDataNode, TreeProps, Typography } from "antd";
import DashboardLayout from "../../component/DashboardLayout";
import { useEffect, useState } from "react";
import { Inventory } from "@/type/inventory";
import { useRouter } from "next/router";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatRupiah } from "@/utils/format_rupiah";
import { ArrowRightOutlined, DownOutlined } from '@ant-design/icons';
import { formatDate } from "@/utils/date_utils";
import { InventoryMovement } from "@/type/inventory_movement";
import Link from "next/link";
const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};
const DetailInventory: React.FC = () => {
    const [inventory, setInventory] = useState<Inventory>();
    const [loading, setLoading] = useState<boolean>(false);
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [viewHistory, setViewHistory] = useState<string>('list');

    const [requestParam, setParamRequst] = useState<RequestParam>({
            table: 'inventory',
            limit: 1,
            page: 1,
            where: [{
                sale_id: '',
            }],
            // whereHas: {
            //     "movements.mutation_history": {
            //         type: "mutation",
            //     },
            // },
            request_column_relation: ['movements', 'location', 'movements.mutation_history', 'movements.user'],
    });

    const [form] = Form.useForm();

    const router = useRouter();

    const availableColumns: TableColumnsType<InventoryMovement> = [
        {
            title: 'No',
            dataIndex: '',
            key: 'no',
            render: (_: any, record: any, index: number) => index + 1,
        },
        {
            title: 'History',
            dataIndex:'type', 
            key: 'type',
            render: (_:any, record: InventoryMovement) => <p>{record.type == 'in' || record.type == 'adjustment' ? 'Masuk' : record.type == 'out' || record.type == 'mutation' ? 'Keluar' : '-' }</p>,
        },
        {
            title: 'Qty',
            dataIndex:'quantity', 
            key: 'quantity',
            // sorter: (a, b) => a.quantity - b.quantity,
            render: (_:any, record: InventoryMovement) => <p>{record.quantity} {record.unit_name}</p>,
        },
        {
            title: 'Transaksi',
            dataIndex:'reference', 
            key: 'reference',
            
            render: (_:any, record: InventoryMovement) => checkSource(record),
        },
        {
            title: 'Tanggal',
            dataIndex:'created_at', 
            key: 'created_at',
            // sorter: (a, b) => new Date(formatDate(a.created_at)).getTime() - new Date(formatDate(a.created_at)).getTime(),
            render: (_:any, record: InventoryMovement) => <p>{formatDate(record.created_at)}</p>,
        },
        {
            title: 'Dibuat Oleh',
            dataIndex:'', 
            key: '',
            render: (_:any, record: InventoryMovement) => <p>{record.user?.name ?? '-'}</p>,
        },
        {
            title: 'Detail',
            dataIndex:'', 
            key: '',
            render: (_:any, record: InventoryMovement) => <Link href={`${getLink(record)}`} className="text-blue-500 mx-4"><ArrowRightOutlined /></Link>
        },
    ]

    const onChangeViewHistory = (view: string) => {
        setViewHistory(view);
    }

    const checkSource = (source: InventoryMovement) => {
        
        switch (source.reference) {
            case 'inventory':
                return <p>Mutasi</p>
            case 'retur':
                return <p>Retur</p>
            case 'exchange':
                return <p>Penukaran barang</p>
            case 'sales':
                return <p>Penjualan</p>
            default:
                return <p>-</p>
        }
        
    }

    const getLink = (source: InventoryMovement) => {
        
        switch (source.reference) {
            case 'inventory':
                return '/inventory/mutasi/' + source.reference_id;
            case 'retur':
                return '/transaction/retur/' + source.reference_id;
            case 'exchange':
                return '/transaction/change/' + source.reference_id;
            case 'sales':
                return '/transaction/penjualan/' + source.reference_id;
            default:
                return '/inventory'
        }
        
    }

    const fetchDetail = async () => {
        setLoading(true);
        try {
            console.log(slug);
            const response = await axiosInstance.get(`/inventory/${slug}`);
            if(response.status == 200){
                setInventory(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const toTreeData = () => {
        const data: TreeDataNode[] = inventory?.movements.map((value, index) => {
            return {
                className: index == 0 ? "mt-5" : "",
                key: index,
                title: (value.type == 'in' || value.type == 'adjustment' ? 'Masuk' : 'Keluar') + `(${value.quantity} ${value.unit_name})`,
                children: value.mutation_history?.map((mutation, indexChild) => {
                    return {
                        key: indexChild,
                        title: mutation.type == 'in' || mutation.type == 'adjustment' ? 'Masuk' : 'Keluar' + `(${mutation.quantity} ${mutation.unit_name})`,
                    }
                }),
            }
        }) ?? [];

        console.log(data);

        return data;
    }

    useEffect(() => {
        if (router.isReady) {
            console.log(router.query);
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        console.log(slug);
        if(slug){
            fetchDetail();
            form.setFieldValue('view', 'list');
        }
    }, [slug]);

    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-4"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Semu Barang',
                        href: '/inventory',
                    },
                    {
                        title: `${inventory?.product_name}`,
                    }
                ]}
            />
            <Card title={`Detail Product `}>
                
                <Card.Grid hoverable={false} style={gridStyle}>Nama Barang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>SKU</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.item?.sku ?? '-'}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Barcode</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.item?.barcode}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatRupiah(parseInt(inventory?.item?.cost ?? '0'))}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatRupiah(parseInt(inventory?.item?.price ?? '0') ?? 0)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Minimum Stok</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.minimum_stock}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Gudang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.location?.name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Stok Saat Ini</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.quantity} {inventory?.unit_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-red-500">{formatRupiah(inventory?.cost ?? 0)}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-green-500">{formatRupiah(inventory?.price ?? 0)}</p></Card.Grid>
            </Card>
            {/* <Tree
                autoExpandParent={true}
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={['0']}
                onSelect={onSelect}
                treeData={toTreeData()}
            /> */}

            
            <Card title="History" className="my-6" extra={
                <Form form={form}>
                    <Form.Item label={`Tampilan`} name={'view'} className="my-6">
                        <Radio.Group onChange={(value) => setViewHistory(value.target.value)}>
                            <Radio.Button value="list" checked={viewHistory == 'list'} >List</Radio.Button>
                            <Radio.Button value="table" checked={viewHistory == 'table'} >Table</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            }>
                {form.getFieldValue('view') == 'list' && <List
                
                header={<div className="text-lg font-bold"></div>}
                bordered
                dataSource={inventory?.movements}
                renderItem={(item) => (
                    <List.Item className="flex">
                    <Tag color="#87d068">{checkSource(item)}</Tag> 
                    <Typography.Text mark>[{item?.quantity} {item?.unit_name}]</Typography.Text> 
                    <Tag className="ml-4" color="#108ee9">{item?.product_name}</Tag> {item.type == 'in' || item.type == 'adjustment' ? 'Masuk' : item.type == 'out' ? 'Keluar' : 'Mutasi'} {item?.inventory?.location?.name} ({formatDate(item.created_at)}) 
                    <Link href={`${getLink(item)}`} className="text-blue-500 mx-4"><ArrowRightOutlined /></Link>
                    <p className="italic">{item.note}</p>
                    </List.Item>
                )}
            /> }
                {form.getFieldValue('view') == 'table' && <Table columns={availableColumns} dataSource={inventory?.movements} rowKey={(record) => record.id}></Table> }
            </Card>
            
            
        </DashboardLayout>
    );
}

export default DetailInventory;