import DashboardLayout from "@/pages/component/DashboardLayout";
import { Button, Card, message, Skeleton, Space, Table, Tag,DatePicker, TimeRangePickerProps } from "antd";
import {
    ReloadOutlined,
    PlusOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { Sale } from "@/type/sale";
import { setCookie } from "cookies-next";
import EditButton from "@/pages/component/EditButton";
import DeleteButton from "@/pages/component/DeleteButton";
import { formatRupiah } from "@/utils/format_rupiah";
import { useEffect, useState } from "react";
import { RequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate, getStartAndEndOfMonth } from "@/utils/date_utils";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const Transaction: React.FC = () => {

    const [request_param, setRequestParam] = useState<RequestParam>({
        table: 'sales',
        request_column: ['order_number', 'delivery_number','total_amount','status', 'sale_id', 'platform', 'sale_date'],
        request_column_relation: [],
        limit: 10,
        page: 1,

    }); 
    const [loading, setLoading] = useState<boolean>(false);
    const [sales, setSales] = useState<Pagination<Sale>>();
    const [totalSales, setTotalSales] = useState<string>('0');
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);
    

    const columns = [
        {
            title: 'No',
            dataIndex: '',
            key: '',
            render: (_: any, record: Sale, index: number) => index + 1,
        },
        {
            title: 'Tanggal',
            dataIndex: 'sale_date',
            key: 'sale_date',
            render: (_: any, record: Sale, index: number) => <p><CalendarOutlined /> {formatDate(record.sale_date!)}</p>,
        },
        {
            title: 'No Transaksi',
            dataIndex: 'order_number',
            key: 'order_number',
            render: (_: any, record: Sale, index: number) => <p>{record.order_number}</p>,
        },
        {
            title: 'No Pengiriman',
            dataIndex:'delivery_number', 
            key: 'delivery_number',
            render: (_: any, record: Sale, index: number) => <p >{record.delivery_number}</p>,
        },
        {
            title: 'Total',
            dataIndex:'total_amount', 
            key: 'total_amount',
            render: (_: any, record: Sale, index: number) => <p >{formatRupiah(parseInt(record.total_amount ?? '0'))}</p>,
        },
        {
            title: 'Status',
            dataIndex:'status', 
            key: 'status',
            render: (_: any, record: Sale, index: number) => <Tag color="default">{record.status?.toUpperCase()}</Tag>,
        },
        {
            title: 'Platform',
            dataIndex:'platform', 
            key: 'platform',
            render: (_: any, record: Sale, index: number) => <p>{record.platform?.toUpperCase()}</p>
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, item: Sale) => (
                <>
                  <EditButton label='' onClick={() => handleEdit(item)}/>
                  <DeleteButton label='' onComfirm={() => handleDelete(item)} okText='Hapus' cancelText='Batal' />
                </>
              ),
        },
    ];

    
    
    const handleEdit = (data: Sale) => {
         setCookie('sale_id', data.sale_id);
         window.location.href = 'transaction/add';
    }

    const handleDelete = (data: Sale) => {

    }

    const getSales = async () => {
        setLoading(true);
        try {
            const request: RequestParam = {
                table: 'sales',
                request_column: ['order_number', 'delivery_number','total_amount','status', 'sale_id', 'platform', 'sale_date'],
                request_column_relation: [],
                limit: 10,
                page: 1,
        
            };
            const response = await axiosInstance.post('/search', request);

            if(response.status == 200){
                setSales(response.data.data);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }
    const getSummery = async (dates: [string, string]) => {
        setLoading(true);
        try {
            
            const response = await axiosInstance.get(`/sales/summery?start_date=${dates[0]}&end_date=${dates[1]}`);

            if(response.status == 200){
                setTotalSales(response.data.data['total']);
            }else{
                message.error(response.statusText);
            }

        } catch (error: any) {
            message.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onChangeRangePicker = (dates: [string, string]) => {
        
        if(dates[0] == '' && dates[1] == ''){
            getSummery([currentStartDate, currentEndDate]);
        }else{
            getSummery(dates);
        }
    }

    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];
    
    useEffect(() => {
        getSales();
        getSummery([getStartAndEndOfMonth().startOfMonth, getStartAndEndOfMonth().endOfMonth]);
        
    }, []);

    return (
        <DashboardLayout>
            <Space className="gap-3 mt-3">
                <Button icon={<PlusOutlined/>} type="primary" href="penjualan/add" >Tambah</Button>
                <Button icon={<ReloadOutlined/>} type="default" onClick={() => {}} >Reload</Button>
                <RangePicker 
                    presets={[
                        {
                        label: <span aria-label="Current Time to End of Day">Now ~ EOD</span>,
                        value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                        },
                        ...rangePresets,
                    ]}
                    onChange={(e, dateString) => onChangeRangePicker(dateString)} 
                    />
            </Space>
            {loading && <Skeleton />}
            {!loading && <Card className="my-4" bordered={false} style={{ width: 300 }}>
                <p>Total Penjualan Bulan ini</p>
                <p className="text-xl text-green-500">{formatRupiah(parseInt(totalSales))}</p>
            </Card>}
            <Table columns={columns} dataSource={sales?.data} rowKey={(record) => record.sale_id!} pagination={false} />
        </DashboardLayout>
    );
}

export default Transaction;

