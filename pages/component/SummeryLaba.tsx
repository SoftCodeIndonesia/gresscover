import { useEffect, useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import { Report } from "@/type/report";
import { Breadcrumb, Button, Card, Col, DatePicker, message, Row, Space, Statistic, Table, TableColumnsType, TimeRangePickerProps } from "antd";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate, formatDateOnlyMonthAndYear, getStartAndEndOfYear } from "@/utils/date_utils";
import {
    FileExcelFilled,
    ReloadOutlined,
} from '@ant-design/icons';
import { formatRupiah } from "@/utils/format_rupiah";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const SummeryLaba: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [summery, setSummery] = useState<Report>({
        bulan: '',
        laba_kotor: 0,
        laba_bersih: 0,
        penjualan: 0,
        retur: 0,
        penukaran: 0,
        pemasukan_lainnya: 0,
        pengeluaran: 0,
        pengeluaran_lainnya: 0,
        total_pemasukan: 0,
        total_pengeluaran: 0,
        modal: 0,
    });
    const [startMonth, setStartMonth] = useState<string>(getStartAndEndOfYear().startOfYear);
    const [endMonth, setEndMonth] = useState<string>(getStartAndEndOfYear().endOfyear);
    const [request_param, setRequestParam] = useState<{type: string, dates: string[]}>({
        dates: [],
        type: 'search'
    });
    const columns: TableColumnsType<Report> = [
        {
            title: 'Bulan',
            dataIndex: 'bulan',
            key: 'bulan',
            fixed: 'left',
            render: (_: any, record: Report, index: number) => <p>{formatDateOnlyMonthAndYear(record.bulan)}</p>
        },
        {
            title: 'Total Penjualan',
            dataIndex: 'penjualan',
            key: 'penjualan',
            fixed: 'left',
            render: (_: any, record: Report, index: number) => <p className="text-green-500">{formatRupiah(record.penjualan)}</p>
        },
        {
            title: 'Total Pemasukan',
            dataIndex: 'total_pemasukan',
            key: 'total_pemasukan',
            fixed: 'left',
            render: (_: any, record: Report, index: number) => <p className="text-green-500">{formatRupiah(record.total_pemasukan)}</p>
        },
        {
            title: 'Laba Kotor',
            dataIndex: 'laba_kotor',
            key: 'laba_kotor',
            fixed: 'left',
            render: (_: any, record: Report, index: number) => <p className="text-red-500">{formatRupiah(record.laba_kotor)}</p>
        },
        
        {
            title: 'Retur',
            dataIndex: 'retur',
            key: 'retur',
            render: (_: any, record: Report, index: number) => <p className="text-red-500">{formatRupiah(record.retur)}</p>
        },
        {
            title: 'Penukaran',
            dataIndex: 'penukaran',
            key: 'penukaran',
            render: (_: any, record: Report, index: number) => <p className="text-red-500">{formatRupiah(record.penukaran)}</p>
        },
       
        {
            title: 'Pengeluaran Lainya',
            dataIndex: 'pengeluaran_lainnya',
            key: 'pengeluaran_lainnya',
            render: (_: any, record: Report, index: number) => <p className="text-red-500">{formatRupiah(record.pengeluaran_lainnya)}</p>
        },
        {
            title: 'Total Pengeluaran',
            dataIndex: 'total_pengeluaran',
            key: 'total_pengeluaran',
            render: (_: any, record: Report, index: number) => <p className="text-red-500">{formatRupiah(record.total_pengeluaran)}</p>
        },
        {
            title: 'Laba Bersih',
            dataIndex: 'laba_bersih',
            key: 'laba_bersih',
            fixed: 'left',
            render: (_: any, record: Report, index: number) => <p className="text-green-500">{formatRupiah(record.laba_bersih)}</p>
        },
    ]

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 3 Month', value: [dayjs().add(-3, 'month'),  dayjs()] },
        { label: 'Last 6 Month', value: [dayjs().add(-6, 'month'), dayjs()] },
        { label: 'Last 1 Year', value: [dayjs().add(-12, 'month'), dayjs()] },
    ];

    const onChangeRangePicker = (dates: [string, string]) => {
        
        var range: [string, string] = dates;

        if(dates[0] == '' && dates[1] == ''){
            const start = getStartAndEndOfYear().startOfYear;
            const end = getStartAndEndOfYear().endOfyear;
            range = [start, end];
        }else{
            range = [`${range[0]}`, `${range[1]}`];
        }

        setStartMonth(range[0]);
        setEndMonth(range[1]);
        request_param.dates = [range[0], range[1]];
        setRequestParam(request_param);
        getReport(request_param);
       
    }


    const getReport = async (request: {type: string, dates: string[]}) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/report', request);

            if(response.status == 200){
                const reports: Report[] = response.data.data;
                const summery = reports.pop();
                setReports(reports);
                setSummery(summery!);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onExport = async () => {
        const request = {...request_param};
        
        request.type = 'export';
        setLoading(true);
        try {
            const response = await axiosInstance.post('/report', request, {
                responseType: 'blob',
            });
            // Buat URL untuk file yang di-download
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const date = new Date;
            
            // Buat elemen <a> untuk memicu download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan_laba_${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`); // Nama file yang akan di-download
            document.body.appendChild(link);

            // Klik link untuk memulai download
            link.click();

            // Hapus link setelah download selesai
            document.body.removeChild(link);
        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const request = {...request_param};
        request.dates = [startMonth, endMonth];
        setRequestParam(request);
        getReport(request);
    }, [])

    return (
        <>
            <p className="text-lg font-bold">Laporan Laba</p>
            <Row gutter={16} className="mt-6">
                <Col span={12} className="">
                    <Card><Statistic title="Laba Bersih" valueStyle={{ color: '#3f8600' }} value={formatRupiah(summery.laba_bersih)} loading={loading} /></Card>
                </Col>
                
                <Col span={12} className="">
                    <Card><Statistic title="Laba Kotor" valueStyle={{ color: '#cf1322' }} value={summery.laba_kotor} loading={loading} /></Card>
                </Col>
            </Row>
            <Space className="gap-3 my-6">
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => getReport(request_param)} className="" >Reload</Button>
                <RangePicker 
                    picker="month"
                    presets={[
                        {
                        label: <span aria-label="1 Tahun Sekarang Dari Bulan Januari">Now ~ EOD</span>,
                            value: () => [dayjs().startOf('year'), dayjs().endOf('year')], // 5.8.0+ support function
                        },
                        ...rangePresets,
                    ]}
                    defaultPickerValue={[dayjs(startMonth), dayjs(endMonth)]}
                    defaultValue={[dayjs(startMonth), dayjs(endMonth)]}
                    onChange={(e, dateString) => onChangeRangePicker(dateString)} 
                />
                <Button type="default" icon={<FileExcelFilled/>} onClick={onExport}>Export Ke Excel</Button>
            </Space>
            <Table columns={columns} dataSource={reports} scroll={{ x: 'max-content'}} loading={loading} pagination={false} rowKey={(record) => record.bulan} />
        </>
    );
}

export default SummeryLaba;