import DashboardLayout from "@/pages/component/DashboardLayout";
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from "@/type/purchase";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { printPurchaseOrder } from "@/utils/printPurchaseOrderPdf";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Breadcrumb, Button, Card, Col, Dropdown, MenuProps, message, Row, Space, Spin, Table, TableColumnsType, Tag } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PrinterOutlined } from "@ant-design/icons";

const PurchaseOrderDetail: React.FC = () => {
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [slug, setSlug] = useState<number | undefined>(undefined);

    const statusColors: Record<string, string> = {
        'draft': 'default',
        'pending': 'orange',
        'completed': 'green',
        'cancelled': 'red',
        'paid': 'blue',
        'partially_paid': 'cyan'
    };

    const statusLabels: Record<string, string> = {
        'draft': 'Draft',
        'pending': 'Pending',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan',
        'paid': 'Lunas',
        'partially_paid': 'Bayar Sebagian'
    };

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <Button type="text" onClick={() => handleStatusChange('pending')}>
                    Menunggu Diterima
                </Button>
            ),
        },
        {
            key: '2',
            label: (
                <Button type="text" onClick={() => handleStatusChange('receive')}>
                    Diterima
                </Button>
            ),
        },
        {
            key: '3',
            label: (
                <Button type="text" onClick={() => handleStatusChange('completed')}>
                    Set Selesai
                </Button>
            ),
        },
        {
            key: '4',
            label: (
                <Button type="text" danger onClick={() => handleStatusChange('cancel')}>
                    Batalkan
                </Button>
            ),
        },
        {
            key: '5',
            label: (
                <Button type="text" onClick={() => router.push(`/purchase/invoices/edit/${slug}`)}>
                    Edit
                </Button>
            ),
        },
    ];

    const columns: TableColumnsType<PurchaseOrderItem> = [
        {
            title: "Nama Produk",
            dataIndex: "product_name",
            key: "product_name",
        },
        {
            title: "SKU",
            dataIndex: "sku",
            key: "sku",
            width: 150,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: 'center' as const,
        },
        {
            title: "Satuan",
            dataIndex: "unit_name",
            key: "unit_name",
            width: 100,
        },
        {
            title: "Harga",
            dataIndex: "price",
            key: "price",
            width: 150,
            align: 'right' as const,
            render: (_: any, record: PurchaseOrderItem, index: number) => record.is_variant ? <></> : formatRupiah(record.price),
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            width: 150,
            align: 'right' as const,
            render: (_: any, record: PurchaseOrderItem, index: number) => record.is_variant ? <></> : formatRupiah(record.total),
        },
    ];

    const fetchPurchaseOrderDetail = async () => {
        if (!slug) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/purchase-orders/${slug}`);
            if (response.status === 200) {
                setPurchaseOrder(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengambil data invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        if (!purchaseOrder) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/purchase-orders/${slug}/${status}`);
            
            if (response.status === 200) {
                message.success('Status berhasil diubah');
                fetchPurchaseOrderDetail();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengubah status');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = () => {
        if (purchaseOrder?.status === "completed") return <Tag color="green">SELESAI</Tag>;
        if (purchaseOrder?.status === "pending") return <Tag color="orange">PENDING</Tag>;
        if (purchaseOrder?.status === "cancel") return <Tag color="red">BATAL</Tag>;
        if (purchaseOrder?.status === "received") return <Tag color="blue">DITERIMA</Tag>;
        return <Tag color="default">DRAFT</Tag>;
    };

    const getStatusTag = () => {
        if (!purchaseOrder?.status) return null;
        
        const status = purchaseOrder.status;
        const color = statusColors[status] || 'default';
        const label = statusLabels[status] || capitalizeEachWord(status);
        
        return label.toUpperCase();
    };

    const calculateSummary = () => {
        if (!purchaseOrder) return null;
        
        const subtotal = purchaseOrder.subtotal || 0;
        const additionalCost = purchaseOrder.additional_cost || 0;
        const discount = purchaseOrder.discount_amount || 0;
        const ppn = purchaseOrder.ppn_amount || 0;
        const total = purchaseOrder.total_amount || 0;
        
        return (
            <>
                <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <strong>Subtotal</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={2} align="right">
                        <strong>{formatRupiah(subtotal)}</strong>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                        <Table.Summary.Cell index={2} colSpan={4} align="right">
                            Biaya Tambahan
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} colSpan={2} align="right">
                            {formatRupiah(additionalCost)}
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                
                 <Table.Summary.Row>
                    <Table.Summary.Cell index={4} colSpan={4} align="right">
                        Diskon
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} colSpan={2} align="right">
                        -{formatRupiah(discount)}
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={6} colSpan={4} align="right">
                        PPN
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} colSpan={2} align="right">
                        {formatRupiah(ppn)}
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={8} colSpan={4} align="right">
                        <strong>TOTAL</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={9} colSpan={2} align="right">
                        <strong>{formatRupiah(total)}</strong>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
            </>
        );
    };

    const showPaymentMethod = () => {

        switch (purchaseOrder?.payment_method) {
            case 'bank':
                return 'Bank Transfer';
            case 'cash':
                return 'Cash';
            case 'cod':
                return 'COD';
        
            default:
                return 'Lainya';
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as unknown as number);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        
        if (slug) {
            fetchPurchaseOrderDetail();
        }
    }, [slug]);

    if (!purchaseOrder && !loading) {
        return (
            <DashboardLayout>
                <Card>
                    <p>Data tidak ditemukan</p>
                </Card>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Spin spinning={loading}>
                <Breadcrumb
                    separator=">"
                    className="mb-4"
                    items={[
                        {
                            title: 'Home',
                            href: '/',
                        },
                        {
                            title: 'Pembelian',
                            href: '/purchase',
                        },
                        {
                            title: purchaseOrder?.invoice_number || 'Detail Invoice',
                        }
                    ]}
                />
                
                <Card 
                    title="Detail Invoice Pembelian" 
                    extra={
                        <Space>
                            <Dropdown menu={{ items }} placement="bottomLeft">
                                <Button>{getStatusTag()}</Button>
                            </Dropdown>
                            {purchaseOrder?.status === PurchaseOrderStatus.RECEIVED && <Button href={`/checking/add?po=${purchaseOrder?.purchase_order_id}`}>Lakukan Pemeriksaan</Button>}
                            <Button type="primary" icon={<PrinterOutlined/>} onClick={() => printPurchaseOrder(purchaseOrder!)}>Cetak PDF</Button>
                        </Space>
                    }
                >
                    <Row className="mb-3">
                        <Col span={6}><strong>Nomor Invoice</strong></Col>
                        <Col span={18}>{purchaseOrder?.invoice_number}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col span={6}><strong>Tanggal Order</strong></Col>
                        <Col span={18}>{formatDate(purchaseOrder?.order_date || '')}</Col>
                    </Row>
                    
                    
                    <Row className="mb-3">
                        <Col span={6}><strong>Jatuh Tempo</strong></Col>
                        <Col span={18}>{formatDate(purchaseOrder?.due_date || '')}</Col>
                    </Row>
                    
                    
                    <Row className="mb-3">
                        <Col span={6}><strong>Status</strong></Col>
                        <Col span={18}>{showStatus()}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col span={6}><strong>Catatan</strong></Col>
                        <Col span={18}>{purchaseOrder?.notes || '-'}</Col>
                    </Row>
                    
                    <Row className="mb-3">
                        <Col span={6}><strong>Dibuat Pada</strong></Col>
                        <Col span={18}>{formatDate(purchaseOrder?.created_at || '')}</Col>
                    </Row>
                    
                    {purchaseOrder?.vendor && (
                        <>
                            <div className="mt-6 mb-4">
                                <h3 className="text-lg font-semibold">Informasi Vendor</h3>
                            </div>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Vendor</strong></Col>
                                <Col span={18}>{purchaseOrder.vendor.name || '-'}</Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Telepon</strong></Col>
                                <Col span={18}>{purchaseOrder.vendor.phone || '-'}</Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Email</strong></Col>
                                <Col span={18}>{purchaseOrder.vendor.email || '-'}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col span={6}><strong>Alamat</strong></Col>
                                <Col span={18}>{purchaseOrder.vendor.address || '-'}</Col>
                            </Row>
                        </>
                    )}
                    {purchaseOrder?.payment && (
                        <>
                            <div className="mt-6 mb-4">
                                <h3 className="text-lg font-semibold">Informasi Pembayaran</h3>
                            </div>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Metode Pembayaran</strong></Col>
                                <Col span={18}>{showPaymentMethod()}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col span={6}><strong>Bank</strong></Col>
                                <Col span={18}>{purchaseOrder.payment.bank || '-'}</Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Nomor Rekening</strong></Col>
                                <Col span={18}>{purchaseOrder.payment.account_number || '-'}</Col>
                            </Row>
                            
                            <Row className="mb-3">
                                <Col span={6}><strong>Nama Rekening</strong></Col>
                                <Col span={18}>{purchaseOrder.payment.account_name || '-'}</Col>
                            </Row>
                        </>
                    )}
                </Card>
                
                <Card title="Daftar Item" className="mt-4">
                    <Table
                        columns={columns}
                        dataSource={purchaseOrder?.items || []}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        summary={calculateSummary}
                    />
                </Card>
                
                <div className="mt-4 flex justify-end gap-3">
                    <Button onClick={() => router.back()}>
                        Kembali
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={() => router.push(`/purchase/add?id=${slug}`)}
                    >
                        Edit Pembelian Barang
                    </Button>
                </div>
            </Spin>
        </DashboardLayout>
    );
};

export default PurchaseOrderDetail;