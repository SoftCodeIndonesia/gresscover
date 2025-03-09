import { Card, Col, DatePicker, message, Row, Statistic, TimeRangePickerProps } from "antd";
import DashboardLayout from "./component/DashboardLayout";
import { useEffect, useState } from "react";
import { StatisticDashbaord } from "@/type/statistic";
import axiosInstance from "@/utils/axiosInstance";
import { formatRupiah } from "@/utils/format_rupiah";
import InventoryPage from "./inventory";
import InventoryTable from "./component/InventoryTable";
import Title from "antd/es/typography/Title";
import { getStartAndEndOfMonth } from "@/utils/date_utils";
import dayjs from "dayjs";
import SummeryLaba from "./component/SummeryLaba";
import SummerySales from "./component/SummerySales";
const { RangePicker } = DatePicker;
const Dashboard = () => {
    const [statisticData, setStatistic] = useState<StatisticDashbaord>();
    const [dataLaba, setLaba] = useState<{
        laba_kotor: number,
        total_pengeluaran: number,
        laba_bersih: number,
    }>({laba_bersih: 0, laba_kotor: 0, total_pengeluaran: 0});
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingLaba, setLoadingLaba] = useState<boolean>(false);
    
    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    

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

    const getLaba = async (dates: string[]) => {
        setLoadingLaba(true);
        try {
            const response = await axiosInstance.post('/summery/laba', {date: dates});
            if(response.status == 200){
                setLaba(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoadingLaba(false);
        }
    }

    const onChangeRangePicker = (dates: [string, string]) => {
            
        var range: [string, string] = dates;

        if(dates[0] == '' && dates[1] == ''){
            const start = getStartAndEndOfMonth().startOfMonth;
            const end = getStartAndEndOfMonth().endOfMonth;
            range = [start, end];
        }else{
            range = [`${range[0]} 00:00:00`, `${range[1]} 23:59:00`];
        }

        setCurrentEndDate(range[1]);
        setCurrentStartDate(range[0]);
        getLaba(range);
    }

    useEffect(() => {
        getLaba([currentStartDate, currentEndDate]);
        getStatistic();
    }, []);

    return (
        <DashboardLayout>
            <SummeryLaba/>
            <Row gutter={16} className="mt-6">
                <Col span={8} className="mb-3">
                    <Card><Statistic title="Total Semua Assets" value={formatRupiah(statisticData?.total_asset ?? 0)} loading={loading} /></Card>
                </Col>
               
                <Col span={8} className="mb-3">
                    <Card><Statistic title="Total Semua Barang" value={statisticData?.total_barang ?? 0} loading={loading} /></Card>
                    {/* <Statistic title="Account Balance (CNY)" value={112893} precision={2} /> */}
                    {/* <Button style={{ marginTop: 16 }} type="primary">
                        Recharge
                    </Button> */}
                </Col>
                <Col span={8} className="mb-3">
                    <Card><Statistic title="Total Gudang" value={statisticData?.total_gudang ?? 0} loading={loading} /></Card>
                    {/* <Statistic title="Active Users" value={112893} loading /> */}
                </Col>
                
                
            </Row>
            <p className="text-lg font-bold mt-6">Daftar Gudang</p>
            <Row gutter={16} className="mt-6" >
                {statisticData?.gudang.map((value: {name: string, total_barang: number, total_asset: number}) => (
                    <Col span={6} className="mb-3" key={name!}>
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
            <div className="mt-4">
            <InventoryTable/>
            </div>
            <SummerySales/>
        </DashboardLayout>
    )
}

export default Dashboard;