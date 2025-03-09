import DashboardLayout from "@/pages/component/DashboardLayout";
import DetailMovement from "@/pages/component/DetailMovement";
import { InventoryMovement } from "@/type/inventory_movement";
import { Movement } from "@/type/movement";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { Breadcrumb, Card, Input, message, Spin, Table, TableColumnsType, Tag } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons"
const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};
const DetailInventoryIn = () => {
    const [movement, setMovement] = useState<Movement>();
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [total_harga_jual, setTotalHargaJual] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>('');
    const router = useRouter();


    const filteredData = movement?.items.filter((value) => {
        return value.product_name?.toLowerCase().includes(keyword.toLowerCase()) ||
            value.item.sku?.toLowerCase().includes(keyword.toLowerCase()) ||
            value.item.barcode?.toLowerCase().includes(keyword.toLowerCase()) ||
            value.amount?.toString().toLowerCase().includes(keyword.toLowerCase()) ||
            value.cost?.toString().toLowerCase().includes(keyword.toLowerCase()) ||
            value.item.barcode?.toLowerCase().includes(keyword.toLowerCase()) ||
            (value.amount * value.quantity).toString().toLowerCase().includes(keyword.toLowerCase()) ||
            (value.cost ?? 0 * value.quantity).toString().toLowerCase().includes(keyword.toLowerCase());
    })

    const column:TableColumnsType<InventoryMovement> = [
        {
            title: 'No',
            dataIndex: '',
            key: 'no',
            render: (_: any, record: any, index: number) => <p>{index + 1}</p>,
        },
        {
            title: 'Product',
            dataIndex: '',
            key: 'product_name',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.product_name}</p>,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.item.sku}</p>,
        },
        {
            title: 'Barcode',
            dataIndex: 'barcode',
            key: 'barcode',
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.item.barcode}</p>,
        },
        {
            title: 'Quantity',
            dataIndex: '',
            key: 'quantity',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.quantity - b.quantity,
            render: (_: any, record: InventoryMovement, index: number) => <p>{record.quantity} {record.unit_name}</p>
        },
        {
            title: 'Harga Beli Satuan',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.cost ?? 0 - (b.cost ?? 0),
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.cost ?? 0)}</p>
        },
        {
            title: 'Harga Jual Satuan',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.amount ?? 0 - (b.amount ?? 0),
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.amount ?? 0)}</p>
        },
        {
            title: 'Total Harga Jual',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.total_amount ?? 0 - (b.total_amount ?? 0),
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.amount * record.quantity)}</p>
        },
        {
            title: 'Harga Beli',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.cost ?? 0 - (b.cost ?? 0),
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.cost ?? 0)}</p>
        },
        {
            title: 'Total Harga Beli',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right',
            sorter: (a:InventoryMovement, b:InventoryMovement) => a.cost ?? 0 - (b.cost ?? 0),
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah((record.cost ?? 0) * record.quantity)}</p>
        },
    ]

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/movement/' + slug);
            if(response.status == 200){
                const movemnetData: Movement = response.data.data;
                const total = movemnetData.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
                setTotalHargaJual(total);
                setMovement(movemnetData);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const showStatus = (status: "Belum Lunas" | "Lunas" | number) => {
        if(status == 1){
            return <Tag color="success">Lunas</Tag>;
        }else if(status == 0){
            return <Tag color="processing">Belum Lunas</Tag>;
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        if(slug){
            fetchDetail();
        }
    }, [slug]);

    return (
        <DashboardLayout>
            <Spin spinning={loading}>
                <Breadcrumb
                    separator=">"
                    className="mb-4"
                    items={[
                        {
                            title: 'Home',
                        },
                        {
                            title: 'Barang Masuk',
                            href: '/inventory/in',
                        },
                        {
                            title: `Detail`,
                        }
                    ]}
                />
            </Spin>
            <Card title={`Detail `} loading={loading}>
                <Card.Grid hoverable={false} style={gridStyle}>Gudang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.location_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>QTY</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.total_item}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Jumlah SKU</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.items.length}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Total Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatRupiah(movement?.total_amount ?? 0)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Total Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatRupiah(total_harga_jual)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Pembayaran</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{showStatus(movement?.is_payment!)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Pembayaran</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{movement?.is_payment == 0 ? "-" : formatDate(movement?.payment_date!)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Dibuat Tgl</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p>{movement != undefined ? formatDate(movement.created_at) : '-'}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Dibuat Oleh</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p>{movement?.user?.name ?? ''}</p></Card.Grid>
                
            </Card>

            <Card title={`Product`} className="mt-6" loading={loading} extra={
                <Input placeholder="Cari Data Barang Masuk" onChange={(e) => setKeyword(e.target.value)} prefix={<SearchOutlined />}  />
            }>
                <Table columns={column} dataSource={filteredData} scroll={{x: 'max-content'}} rowKey={(record) => record.id} pagination={false} summary={pageData => {
                                
        
                                return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={(column.length ?? 1)} colSpan={column.length - 1} align="right"><p className="font-bold">Total</p></Table.Summary.Cell>
                                        <Table.Summary.Cell index={(column.length ?? 2)} align="right">
                                            <p>{formatRupiah(movement?.total_amount ?? 0)}</p>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    
                                </>
                                );
                            }} />
            </Card>

        </DashboardLayout>
    )
}

export default DetailInventoryIn;