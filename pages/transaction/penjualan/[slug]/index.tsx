import DashboardLayout from "@/pages/component/DashboardLayout";
import { InventoryMovement } from "@/type/inventory_movement";
import { RequestParam } from "@/type/request_param";
import { Sale, SaleTax } from "@/type/sale";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { Breadcrumb, Button, Card, Col, Input, message, Row, Select, Skeleton, Spin, Table, TableColumnsType, Tag } from "antd";
import Column from "antd/es/table/Column";
import { TableRowSelection } from "antd/es/table/interface";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SalesDetail: React.FC = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [sale, setSales] = useState<Sale>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'sales',
        limit: 1,
        page: 1,
        where: [{
            sale_id: '',
        }],
        request_column_relation: ['taxes', 'items', 'items.item.parent'],
    });

    const columns: TableColumnsType<InventoryMovement> = [
      
        {
            title: "Nama",
            dataIndex: "",
            render: (_: any, record: InventoryMovement, index: number) => <p>{`${record.item.parent?.name} (${record.item.name})`}</p>,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            width: 150,
            
        },
        {
            title: "Harga",
            dataIndex: "amount",
            width: 200,
            align: 'right',
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.amount)}</p>,
        },
        {
            title: "Total",
            dataIndex: "total_amount",
            width: 200,
            align: 'right',
            render: (_: any, record: InventoryMovement, index: number) => <p>{formatRupiah(record.total_amount)}</p>,
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<InventoryMovement> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;


    const fetchDetail = async () => {
        setLoading(true);
        try {
            requestParam.where = [{
                sale_id: slug,
            }];
            const response = await axiosInstance.post('/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);
                if(response.data.data.data.length > 0){
                    setSales(response.data.data.data[0]);
                }
                
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async (data: any) => {
        setLoading(true);
        try {
            const response = await axiosInstance.put('/sales/status', data);
            if(response){
                const newSale = {...sale!};
                newSale.status = data.status;
                setSales(newSale);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    const statusChange = (value: string) => {
        if(value != 'retur'){
            const data = {
                sale_id: sale?.sale_id,
                status: value,
            }

            updateStatus(data);

        }else{
            console.log(value);
            const data = {
                sale_id: sale?.sale_id,
                status: value,
            }

            updateStatus(data);
        }
    }

    const getStatus = () => {
        if(sale?.status == 'sedang dikemas'){
            return <Tag color="default">{sale?.status.toUpperCase()}</Tag>
        }else if(sale?.status == 'dalam pengiriman'){
            return <Tag color="blue">{sale?.status.toUpperCase()}</Tag>
        }else if(sale?.status == 'pesanan terkirim'){
            return <Tag color="green">{sale?.status.toUpperCase()}</Tag>
        }else if(sale?.status == 'retur'){
            return <Tag color="red">{sale?.status.toUpperCase()}</Tag>
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        fetchDetail();
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
                            title: 'Daftar Penjualan',
                            href: '/transaction/penjualan',
                        },
                        {
                            title: `${sale?.order_number}`,
                        }
                    ]}
                />
                <Card 
                title="Detail Penjualan" 
                extra={<Select
                    value={sale?.status}
                    
                    style={{ width: 150 }}
                    onChange={statusChange}
                    options={[
                        { value: 'sedang dikemas', label: 'Sedang Dikemas', disabled: sale?.status == 'retur' },
                        { value: 'dalam pengiriman', label: 'Dalam Pengiriman', disabled: sale?.status == 'retur' },
                        { value: 'pesanan terkirim', label: 'Pesanan Terkirim', disabled: sale?.status == 'retur' },
                        { value: 'retur', label: 'Retur', disabled: sale?.status == 'retur'},
                    ]}
                />}
                >
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatDate(sale?.sale_date ?? '')}</Col>
                        <Col span={6} pull={18}>Tanggal Penjualan</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{sale?.order_number}</Col>
                        <Col span={6} pull={18}>Nomor Transaksi</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{sale?.delivery_number}</Col>
                        <Col span={6} pull={18}>Nomor Pengiriman</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{getStatus()}</Col>
                        <Col span={6} pull={18}>Status</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{sale?.platform?.toUpperCase()}</Col>
                        <Col span={6} pull={18}>Platform</Col>
                    </Row>
                </Card>
                <Card title="Daftar Item" className="mt-4" extra={<Button type="primary" className="bg-red-600" onClick={() => statusChange('retur')} disabled={!hasSelected} loading={loading}>
                Retur
                </Button>}>
                    <Table columns={columns} rowSelection={rowSelection} dataSource={sale?.items} rowKey={(row) => row.id} pagination={false} summary={pageData => {
                        let totalQuantity = 0;
                        let totalAmount = 0;

                        pageData.forEach(({ quantity, total_amount }) => {
                            totalQuantity += quantity;
                            totalAmount += total_amount;
                        });

                        return (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 1} colSpan={4} align="right"><p className="font-bold">Subtotal</p></Table.Summary.Cell>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 2} align="right">
                                    <p>{formatRupiah(totalAmount)}</p>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            {sale?.taxes?.map((value: SaleTax, index: number) => {
                                return <Table.Summary.Row key={index}>
                                            <Table.Summary.Cell index={index} colSpan={4} align="right"><p className="font-bold">{value.name}</p></Table.Summary.Cell>
                                            <Table.Summary.Cell index={index} align="right">
                                                <p>{value.unit_value == 'percent' ? `${value.value}%` : formatRupiah(value.value)}</p>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                            })}
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 3} colSpan={4} align="right"><p className="font-bold">Total</p></Table.Summary.Cell>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 4} align="right">
                                    <p>{formatRupiah(parseInt(sale?.total_amount ?? "0"))}</p>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                        );
                    }} />
                    
                </Card>
            </Spin>
        </DashboardLayout>
    );
}

export default SalesDetail;