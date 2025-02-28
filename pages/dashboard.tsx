import { Card, Col, message, Row, Statistic } from "antd";
import DashboardLayout from "./component/DashboardLayout";
import { useEffect, useState } from "react";
import { StatisticDashbaord } from "@/type/statistic";
import axiosInstance from "@/utils/axiosInstance";
import { formatRupiah } from "@/utils/format_rupiah";
import InventoryPage from "./inventory";
import InventoryTable from "./component/InventoryTable";
import Title from "antd/es/typography/Title";

const Dashboard = () => {
    const [statisticData, setStatistic] = useState<StatisticDashbaord>();
    const [loading, setLoading] = useState<boolean>(false);

    const getStatistic = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/summery');
            if(response.status == 200){
                setStatistic(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getStatistic();
    }, []);

    return (
        <DashboardLayout>
            <Row gutter={16} >
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Assets" value={formatRupiah(statisticData?.total_asset ?? 0)} loading={loading} /></Card>
                </Col>
               
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Barang" value={statisticData?.total_barang ?? 0} loading={loading} /></Card>
                    {/* <Statistic title="Account Balance (CNY)" value={112893} precision={2} /> */}
                    {/* <Button style={{ marginTop: 16 }} type="primary">
                        Recharge
                    </Button> */}
                </Col>
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Gudang" value={statisticData?.total_gudang ?? 0} loading={loading} /></Card>
                    {/* <Statistic title="Active Users" value={112893} loading /> */}
                </Col>
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Penjualan" valueStyle={{ color: '#3f8600' }} value={formatRupiah(statisticData?.total_penjualan ?? 0)} loading={loading} /></Card>
                    {/* <Statistic title="Active Users" value={112893} loading /> */}
                </Col>
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Total Retur" valueStyle={{ color: '#cf1322' }} value={formatRupiah(statisticData?.total_retur ?? 0)} loading={loading} /></Card>
                    {/* <Statistic title="Active Users" value={112893} loading /> */}
                </Col>
                <Col span={6} className="mb-3">
                    <Card><Statistic title="Pengeluaran lainya" valueStyle={{ color: '#cf1322' }} value={formatRupiah(statisticData?.total_pengeluaran_lainya ?? 0)} loading={loading} /></Card>
                    {/* <Statistic title="Active Users" value={112893} loading /> */}
                </Col>
            </Row>
            <Title level={4}>Daftar Gudang</Title>
            <Row gutter={16} >
                {statisticData?.gudang.map((value: {name: string, total_barang: number, total_asset: number}) => (
                    <Col span={6} className="mb-3">
                        <Card>
                        {/* <Statistic title={value.name} value={`${formatRupiah(value?.total_asset ?? 0)}/${value.total_barang} barang`} loading={loading} /> */}
                        <div className="flex flex-col">
                            <p className="text-gray-400">{value.name}</p>
                            <p className="text-2xl"> {value.total_barang}<span className="text-sm"> /{formatRupiah(value?.total_asset ?? 0)}</span></p>
                        </div>

                        </Card>
                    </Col>
                ))}
            </Row>
            <div className="my-4">
            <InventoryTable/>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard;