import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import { InventoryMovement } from "@/type/inventory_movement";
import { RequestParam } from "@/type/request_param";
import { Sale, SaleItem, SaleTax } from "@/type/sale";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { formatRupiah } from "@/utils/format_rupiah";
import { capitalizeEachWord } from "@/utils/text_utils";
import { Breadcrumb, Button, Card, Col, Dropdown, Input, MenuProps, message, Row, Select, Skeleton, Spin, Table, TableColumnsType, Tag } from "antd";
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
        request_column_relation: ['taxes', 'items', 'items'],
    });


    const items: MenuProps['items'] = [
        {
          key: '1',
          label: (
            <CustomButtonPopConfirm disabled={sale?.status == 'sedang dikemas'} label="Sedang Dikemas" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('sedang dikemas')} onCancel={() => {}} />
          ),
        },
        {
          key: '2',
          label: (
            <CustomButtonPopConfirm disabled={sale?.status == 'dalam pengiriman'} label="Dalam pengiriman" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('dalam pengiriman')} onCancel={() => {}} />
          ),
        },
        {
          key: '3',
          label: (
            <CustomButtonPopConfirm disabled={sale?.status == 'pesanan terkirim'} label="Pesanan Terkirim" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('pesanan terkirim')} onCancel={() => {}} />
          ),
        },
        {
          key: '4',
          label: (
            <DeleteButton label='Hapus' onComfirm={() => handleDelete([sale?.sale_id!])} okText='Hapus' cancelText='Batal' />
          ),
        },
    ];

    const columns: TableColumnsType<SaleItem> = [
      
        {
            title: "Nama",
            dataIndex: "",
            render: (_: any, record: SaleItem, index: number) => <p>{`${record.product_name}`}</p>,
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
            render: (_: any, record: SaleItem, index: number) => <p>{formatRupiah(parseInt(record.price))}</p>,
        },
        {
            title: "Total",
            dataIndex: "total_amount",
            width: 200,
            align: 'right',
            render: (_: any, record: SaleItem, index: number) => <p>{formatRupiah(record.total_price)}</p>,
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<SaleItem> = {
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

    const handleUpdateStatus = async (status: string) => {
        
        setLoading(true);
        try {

            const data = {
                "sale_id": sale!.sale_id,
                "status": status,
            }

            console.log(data);
            
            const response = await axiosInstance.put(`/sales/status`, data);

            if(response.status == 200){
                message.success('Berhasil!');
                fetchDetail();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (sale: string[]) => {
        setLoading(true);
        try {

            const data = {
                "data": sale,
            }

            console.log(data);
            
            const response = await axiosInstance.post(`/sales/del`, data);

            if(response.status == 200){
                message.success('Berhasil Hapus Data!');
                router.back();
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
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
        }else if(sale?.status == 'lunas'){
            return <Tag color="green">{'Selesai'}</Tag>
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
                extra={<Dropdown menu={{ items }} placement="bottom">
                            <Button>{capitalizeEachWord(sale?.status ?? '')}</Button>
                        </Dropdown>}
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
                    <Row className="mb-3">
                        <Col span={18} push={6}>{sale?.user_name}</Col>
                        <Col span={6} pull={18}>Dibuat Oleh</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatDate(sale?.created_at!)}</Col>
                        <Col span={6} pull={18}>Dibuat Tgl</Col>
                    </Row>
                </Card>
                <Card title="Daftar Item" className="mt-4">
                    <Table columns={columns} dataSource={sale?.items} rowKey={(row) => row.sale_item_id} pagination={false} summary={pageData => {
                        let totalQuantity = 0;
                        let totalAmount = sale?.total_amount_before_tax;

                        // pageData.forEach(({ quantity, total_price }) => {
                        //     totalQuantity += quantity;
                        //     totalAmount += total_price;
                        // });

                        return (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 1} colSpan={3} align="right"><p className="font-bold">Subtotal</p></Table.Summary.Cell>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 2} align="right">
                                    <p>{formatRupiah(sale?.total_amount_before_tax ?? 0)}</p>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            {sale?.taxes?.map((value: SaleTax, index: number) => {
                                return <Table.Summary.Row key={index}>
                                            <Table.Summary.Cell index={index} colSpan={3} align="right"><p className="font-bold">{value.name}</p></Table.Summary.Cell>
                                            <Table.Summary.Cell index={index} align="right">
                                                <p>{value.unit_value == 'percent' ? `${value.value}% / ${formatRupiah(sale.total_amount_before_tax * value.value / 100)}` : formatRupiah(value.value)}</p>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                            })}
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 3} colSpan={3} align="right"><p className="font-bold">Total</p></Table.Summary.Cell>
                                <Table.Summary.Cell index={(sale?.items.length ?? 1) + 4} align="right">
                                    <p>{formatRupiah(sale?.total_amount_after_tax ?? 0)}</p>
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