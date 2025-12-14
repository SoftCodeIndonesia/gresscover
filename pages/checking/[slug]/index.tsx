import DashboardLayout from "@/pages/component/DashboardLayout";
import { PurchaseOrderItem } from "@/type/purchase";
import { QualityReport, QualityReportItem } from "@/type/reportIssue";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Breadcrumb, Button, Card, Col, Descriptions, Divider, message, Row, Spin, Table, TableColumnsType, Tag, Typography } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

const CheckingDetail: React.FC = () => {
    const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [slug, setSlug] = useState<number | undefined>(undefined);

    const actionColors: Record<string, string> = {
        'accept': 'green',
        'reject': 'red',
        'discount': 'orange',
        'return': 'volcano'
    };

    const actionLabels: Record<string, string> = {
        'accept': 'Diterima',
        'reject': 'Ditolak',
        'discount': 'Diskon',
        'return': 'Dikembalikan'
    };

    const defectTypeColors: Record<string, string> = {
        'Salah Ukuran/Warna': 'red',
        'Cacat Produksi': 'orange',
        'Rusak': 'volcano',
        'Kadaluarsa': 'purple',
        'Lainnya': 'default'
    };

    const columns: TableColumnsType<QualityReportItem> = [
        {
            title: "Produk",
            dataIndex: "product_name",
            key: "product_name",
            render: (text: string, record: QualityReportItem) => (
                <div>
                    <div><strong>{text}</strong></div>
                    <div><small>SKU: {record.sku}</small></div>
                </div>
            )
        },
        {
            title: "Quantity Dipesan",
            dataIndex: "order_item",
            key: "order_quantity",
            width: 120,
            align: 'center' as const,
            render: (orderItem: any) => orderItem?.quantity || 0
        },
        {
            title: "Diterima",
            dataIndex: "received_quantity",
            key: "received_quantity",
            width: 100,
            align: 'center' as const,
        },
        {
            title: "Baik",
            dataIndex: "good_quantity",
            key: "good_quantity",
            width: 100,
            align: 'center' as const,
        },
        {
            title: "Defect",
            dataIndex: "qty_defect",
            key: "qty_defect",
            width: 100,
            align: 'center' as const,
            render: (value: number) => (
                <Tag color={value > 0 ? "red" : "green"}>
                    {value}
                </Tag>
            )
        },
        {
            title: "Tipe Defect",
            dataIndex: "defect_type",
            key: "defect_type",
            width: 150,
            render: (defectType: string | null) => (
                defectType ? (
                    <Tag color={defectTypeColors[defectType] || 'default'}>
                        {defectType}
                    </Tag>
                ) : '-'
            )
        },
        {
            title: "Catatan",
            dataIndex: "note",
            key: "note",
            render: (note: string | null) => note || '-'
        },
    ];

    

    const fetchQualityReportDetail = async () => {
        if (!slug) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/quality-reports/${slug}`);
            if (response.status === 200) {
                setQualityReport(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengambil data laporan kualitas');
        } finally {
            setLoading(false);
        }
    };

    const showActionTag = () => {
        if (!qualityReport?.action) return null;
        
        const action = qualityReport.action;
        const color = actionColors[action] || 'default';
        const label = actionLabels[action] || capitalizeEachWord(action);
        
        return (
            <Tag color={color}>
                {label.toUpperCase()}
            </Tag>
        );
    };

    const calculateDefectPercentage = (defect: number, total: number) => {
        if (total === 0) return '0%';
        return ((defect / total) * 100).toFixed(2) + '%';
    };

    const calculateSummary = () => {
        if (!qualityReport) return null;
        
        const totalDefect = qualityReport.total_defect || 0;
        const totalReceived = qualityReport.total_received || 0;
        const defectPercentage = qualityReport.defect_percentage || '0';
        
        return (
            <>
                <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2} align="right">
                        <strong>Total Diterima</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                        <strong>{totalReceived}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="center">
                        <strong>-</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={2} align="right">
                        <strong>Total Defect</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                        <Tag color={totalDefect > 0 ? "red" : "green"}>
                            <strong>{totalDefect}</strong>
                        </Tag>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={5} colSpan={6} align="right">
                        <strong>Persentase Defect</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="center">
                        <Tag color={parseFloat(defectPercentage) > 5 ? "red" : parseFloat(defectPercentage) > 0 ? "orange" : "green"}>
                            <strong>{defectPercentage}%</strong>
                        </Tag>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
            </>
        );
    };

    const calculatePOSummary = () => {
        if (!qualityReport?.purchase_order) return null;
        
        const po = qualityReport.purchase_order;
        const subtotal = po.subtotal;
        const additionalCost = po.additional_cost;
        const discount = po.discount_amount;
        const ppn = po.ppn_amount;
        const total = po.total_amount;
        
        return (
            <>
                <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <strong>Subtotal</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={3} align="right">
                        <strong>{formatRupiah(subtotal)}</strong>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={2} colSpan={3} align="right">
                        Biaya Tambahan
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} colSpan={3} align="right">
                        {formatRupiah(additionalCost)}
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={4} colSpan={3} align="right">
                        Diskon
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} colSpan={3} align="right">
                        -{formatRupiah(discount)}
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={6} colSpan={3} align="right">
                        PPN
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} colSpan={3} align="right">
                        {formatRupiah(ppn)}
                    </Table.Summary.Cell>
                </Table.Summary.Row>
                
                <Table.Summary.Row>
                    <Table.Summary.Cell index={8} colSpan={3} align="right">
                        <strong>TOTAL</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={9} colSpan={3} align="right">
                        <strong>{formatRupiah(total)}</strong>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
            </>
        );
    };

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as unknown as number);
        }
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        if (slug) {
            fetchQualityReportDetail();
        }
    }, [slug]);

    if (!qualityReport && !loading) {
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
                            title: 'Pengecekan Barang',
                            href: '/checking',
                        },
                        {
                            title: 'Detail',
                        },
                        {
                            title: qualityReport?.unique_id || 'Detail Laporan',
                        }
                    ]}
                />
                
                <Card 
                    title="Detail Laporan Pengecekan Barang" 
                    extra={
                        <div className="flex gap-2">
                            
                            <Button 
                                type="primary"
                                href={`/checking/edit?id=${slug}`}
                            >
                                Edit Laporan
                            </Button>
                            <Button 
                                type="primary"
                                onClick={() => window.print()}
                            >
                                Cetak Laporan
                            </Button>
                        </div>
                    }
                >
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col span={12}>
                            <Descriptions title="Informasi Laporan" column={1} bordered>
                                <Descriptions.Item label="Nomor Laporan">
                                    {qualityReport?.unique_id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tanggal Inspeksi">
                                    {formatDate(qualityReport?.inspection_date || '')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Penerima">
                                    {qualityReport?.receiver_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Petugas Inspeksi">
                                    {qualityReport?.inspector?.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tindakan">
                                    {showActionTag()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Catatan Tindakan">
                                    {qualityReport?.action_note || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        
                        <Col span={12}>
                            <Card title="Statistik Inspeksi" className="h-full">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Card size="small">
                                            <div className="text-center">
                                                <Title level={3} className="!mb-1">
                                                    {qualityReport?.total_received || 0}
                                                </Title>
                                                <Text type="secondary">Total Diterima</Text>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <div className="text-center">
                                                <Title level={3} className="!mb-1">
                                                    {qualityReport?.total_defect || 0}
                                                </Title>
                                                <Text type="secondary">Total Defect</Text>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={24}>
                                        <Card size="small">
                                            <div className="text-center">
                                                <Title level={3} className="!mb-1">
                                                    {qualityReport?.defect_percentage || '0'}%
                                                </Title>
                                                <Text type="secondary">Persentase Defect</Text>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>

                    <Divider orientation="left">Detail Item yang Diinspeksi</Divider>
                    
                    <Table
                        columns={columns}
                        dataSource={qualityReport?.items || []}
                        rowKey="id"
                        pagination={false}
                        scroll={{ x: 'max-content' }}
                        summary={calculateSummary}
                        className="mb-6"
                    />

                    {qualityReport?.purchase_order && (
                        <>
                            <Divider orientation="left">Informasi Purchase Order</Divider>
                            
                            <Card className="mb-4">
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Row className="mb-3">
                                            <Col span={8}><strong>Nomor Invoice</strong></Col>
                                            <Col span={16}>{qualityReport.purchase_order.invoice_number}</Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col span={8}><strong>Tanggal Order</strong></Col>
                                            <Col span={16}>{formatDate(qualityReport.purchase_order.order_date || '')}</Col>
                                        </Row>
                                        <Row className="mb-3">
                                            <Col span={8}><strong>Jatuh Tempo</strong></Col>
                                            <Col span={16}>{formatDate(qualityReport.purchase_order.due_date || '')}</Col>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row className="mb-3">
                                            <Col span={8}><strong>Metode Pembayaran</strong></Col>
                                            <Col span={16}>
                                                {qualityReport.purchase_order.payment_method === 'bank' ? 'Bank Transfer' : 
                                                 qualityReport.purchase_order.payment_method === 'cash' ? 'Cash' : 
                                                 qualityReport.purchase_order.payment_method === 'cod' ? 'COD' : 'Lainnya'}
                                            </Col>
                                        </Row>
                                        {qualityReport.purchase_order.payment_method === 'bank' && (
                                            <>
                                                <Row className="mb-3">
                                                    <Col span={8}><strong>Bank</strong></Col>
                                                    <Col span={16}>{qualityReport.purchase_order.payment?.bank || '-'}</Col>
                                                </Row>
                                                <Row className="mb-3">
                                                    <Col span={8}><strong>Nomor Rekening</strong></Col>
                                                    <Col span={16}>{qualityReport.purchase_order.payment?.account_number || '-'}</Col>
                                                </Row>
                                                <Row className="mb-3">
                                                    <Col span={8}><strong>Pemilik Rekening</strong></Col>
                                                    <Col span={16}>{qualityReport.purchase_order.payment?.account_name || '-'}</Col>
                                                </Row>
                                            </>
                                        )}
                                    </Col>
                                </Row>
                            </Card>


                        </>
                    )}


                </Card>
            </Spin>
        </DashboardLayout>
    );
};

export default CheckingDetail;