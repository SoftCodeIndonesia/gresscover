import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
import { ExchangeItem, ExchangeType } from "@/type/exchange";
import { InventoryMovement } from "@/type/inventory_movement";
import { RequestParam } from "@/type/request_param";
import { Retur, ReturItem } from "@/type/retur";
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

const ExhangeDetail: React.FC = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [change, setChange] = useState<ExchangeType>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'exchange',
        request_column: [],
        request_column_relation: ['items', 'items.movement','items.inventory_from','items.inventory_to', 'items.sale_item'],
        where: {
            exchange_id: slug,
        },
        limit: 10,
        page: 1,
    });


    const items: MenuProps['items'] = [
        {
          key: '1',
          label: (
            <CustomButtonPopConfirm disabled={change?.status == 'deliver_to_seller'} label="Dikirim ke penjual" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('deliver_to_seller')} onCancel={() => {}} />
          ),
        },
        {
          key: '2',
          label: (
            <CustomButtonPopConfirm disabled={change?.status == 'deliver_to_buyer'} label="Dikirim ke pembeli" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('deliver_to_buyer')} onCancel={() => {}} />
          ),
        },
        {
          key: '3',
          label: (
            <CustomButtonPopConfirm disabled={change?.status == 'completed'} label="Selesai" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('completed')} onCancel={() => {}} />
          ),
        },
    ];

    const columns: TableColumnsType<ExchangeItem> = [
      
        {
            title: "Nama",
            dataIndex: "",
            render: (_: any, record: ExchangeItem, index: number) => <p>{`${record.product_name}`}</p>,
        },
        {
            title: "Ditukar dengan",
            dataIndex: "",
            render: (_: any, record: ExchangeItem, index: number) => <p>{`${record.movement.product_name}`}</p>,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            render: (_: any, record: ExchangeItem, index: number) => <p>{record.quantity} {record.unit_name}</p>,
        },
        {
            title: "Harga",
            dataIndex: "amount",
            align: 'right',
            render: (_: any, record: ExchangeItem, index: number) => <p>{formatRupiah(record.price)}</p>,
        },
        {
            title: "Total",
            dataIndex: "total_amount",
            align: 'right',
            render: (_: any, record: ExchangeItem, index: number) => <p>{formatRupiah(record.total_price)}</p>,
        },
        {
            title: "Kondisi Barang",
            dataIndex: "",
            render: (_: any, record: ExchangeItem, index: number) => <p>{record.item_change_condition == 'completed' ? 'Bagus' : 'Reject'}</p>,
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ExchangeItem> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;


    const fetchDetail = async () => {
        setLoading(true);
        try {
            requestParam.where = {
                exchange_id: slug,
            };
            const response = await axiosInstance.post('/exchange/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);
                if(response.data.data.length > 0){
                    setChange(response.data.data[0]);
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
                "exchange_id": change?.exchange_id,
                "status": status,
            }

            console.log(data);
            
            const response = await axiosInstance.put(`/exchange/status`, {data: [data]});

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
        if(change?.status == 'deliver_to_buyer'){
            return <Tag color="processing">{getStatusString(change?.status)}</Tag>
        }else if(change?.status == 'deliver_to_seller'){
            return <Tag color="warning">{getStatusString(change?.status)}</Tag>
        }else if(change?.status == 'completed'){
            return <Tag color="success">{getStatusString(change?.status)}</Tag>
        }
    }

    const getStatusString = (status: string) => {
        if(status == 'deliver_to_buyer'){
            return 'Dikirim ke pembeli'
        }else if(status == 'deliver_to_seller'){
            return 'Dikirim ke penjual'
        }else if(status == 'completed'){
            return 'selesai';
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
                            title: 'Daftar Penukaran Barang',
                            href: '/transaction/change',
                        },
                        {
                            title: `${change?.exchange_number}`,
                        }
                    ]}
                />
                <Card 
                title="Detail Penjualan" 
                extra={<Dropdown menu={{ items }} placement="bottom">
                            <Button>{capitalizeEachWord(getStatusString(change?.status ?? '') ?? '')}</Button>
                        </Dropdown>}
                >
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatDate(change?.created_at ?? '')}</Col>
                        <Col span={6} pull={18}>Tanggal Pembuatan</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{change?.sales_number}</Col>
                        <Col span={6} pull={18}>Nomor Penjualan</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{change?.delivery_number}</Col>
                        <Col span={6} pull={18}>Nomor Pengiriman</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatRupiah(change?.delivery_fee ?? 0)}</Col>
                        <Col span={6} pull={18}>Biaya Pengiriman</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{getStatus()}</Col>
                        <Col span={6} pull={18}>Status</Col>
                    </Row>
                </Card>
                <Card title="Daftar Item" className="mt-4" >
                    <Table columns={columns} dataSource={change?.items} rowKey={(row) => row.exchange_item_id} pagination={false} />
                    
                </Card>
            </Spin>
        </DashboardLayout>
    );
}

export default ExhangeDetail;