import CustomButtonPopConfirm from "@/pages/component/CustomButtonPopConfirm";
import DashboardLayout from "@/pages/component/DashboardLayout";
import DeleteButton from "@/pages/component/DeleteButton";
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

const ReturDetail: React.FC = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [retur, setRetur] = useState<Retur>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'retur',
        limit: 1,
        page: 1,
        where: [{
            sale_id: '',
        }],
        request_column_relation: ['sales','items', 'items.movement', 'items.inventory'],
    });


    const items: MenuProps['items'] = [
        {
          key: '1',
          label: (
            <CustomButtonPopConfirm disabled={retur?.status == 'dalam pengiriman'} label="Dalam Pengiriman" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('dalam pengiriman')} onCancel={() => {}} />
          ),
        },
        {
          key: '2',
          label: (
            <CustomButtonPopConfirm disabled={retur?.status == 'selesai'} label="Selesai" title="Ganti Status" description="Anda yakin ingin mengganti status?" loading={loading} onConfirm={() => handleUpdateStatus('selesai')} onCancel={() => {}} />
          ),
        },
    ];

    const columns: TableColumnsType<ReturItem> = [
      
        {
            title: "Nama",
            dataIndex: "",
            render: (_: any, record: ReturItem, index: number) => <p>{`${record.product_name}`}</p>,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            render: (_: any, record: ReturItem, index: number) => <p>{record.quantity} {record.unit_name}</p>,
        },
        {
            title: "Harga",
            dataIndex: "amount",
            align: 'right',
            render: (_: any, record: ReturItem, index: number) => <p>{formatRupiah(record.price)}</p>,
        },
        {
            title: "Total",
            dataIndex: "total_amount",
            align: 'right',
            render: (_: any, record: ReturItem, index: number) => <p>{formatRupiah(record.total_price)}</p>,
        },
        {
            title: "Kondisi Barang",
            dataIndex: "",
            render: (_: any, record: ReturItem, index: number) => <p>{record.item_retur_condition == 'completed' ? 'Bagus' : 'Reject'}</p>,
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ReturItem> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;


    const fetchDetail = async () => {
        setLoading(true);
        try {
            requestParam.where = [{
                retur_id: slug,
            }];
            const response = await axiosInstance.post('/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);
                if(response.data.data.data.length > 0){
                    setRetur(response.data.data.data[0]);
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
                "retur_id": retur?.retur_id,
                "status": status,
            }

            console.log(data);
            
            const response = await axiosInstance.put(`/retur/status`, data);

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
        if(retur?.status == 'proses pengembalian'){
            return <Tag color="default">{retur?.status.toUpperCase()}</Tag>
        }else if(retur?.status == 'selesai'){
            return <Tag color="green">{retur?.status.toUpperCase()}</Tag>
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
                            title: 'Daftar Retur',
                            href: '/transaction/retur',
                        },
                        {
                            title: `${retur?.retur_number}`,
                        }
                    ]}
                />
                <Card 
                title="Detail Penjualan" 
                extra={<Dropdown menu={{ items }} placement="bottom">
                            <Button>{capitalizeEachWord(retur?.status ?? '')}</Button>
                        </Dropdown>}
                >
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatDate(retur?.created_at ?? '')}</Col>
                        <Col span={6} pull={18}>Tanggal Pembuatan</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{retur?.sales_number}</Col>
                        <Col span={6} pull={18}>Nomor Penjualan</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{retur?.delivery_number}</Col>
                        <Col span={6} pull={18}>Nomor Pengiriman</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{formatRupiah(retur?.delivery_fee ?? 0)}</Col>
                        <Col span={6} pull={18}>Biaya Pengiriman</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col span={18} push={6}>{getStatus()}</Col>
                        <Col span={6} pull={18}>Status</Col>
                    </Row>
                </Card>
                <Card title="Daftar Item" className="mt-4" >
                    <Table columns={columns} dataSource={retur?.items} rowKey={(row) => row.retur_item_id} pagination={false} />
                    
                </Card>
            </Spin>
        </DashboardLayout>
    );
}

export default ReturDetail;