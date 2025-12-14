import DashboardLayout from "@/pages/component/DashboardLayout";
import { 
    Button, 
    Card, 
    Pagination as AntPagination, 
    message, 
    Space, 
    Table, 
    Tag, 
    DatePicker, 
    TimeRangePickerProps, 
    Typography, 
    Dropdown, 
    Modal, 
    TableColumnsType, 
    TableProps, 
    Input, 
    Select, 
    Row, 
    Col, 
    Statistic,
    Badge,
    Tooltip,
    Popconfirm
} from "antd";
import {
    ReloadOutlined,
    PlusOutlined,
    CalendarOutlined,
    SettingFilled,
    SearchOutlined,
    FileExcelFilled,
    EyeOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    FilterOutlined,
    UserOutlined,
    ShopOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Key, useEffect, useState } from "react";
import { NewRequestParam } from "@/type/request_param";
import { Pagination } from "@/type/pagination";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate, formatDateOnlyMonthAndYear, formatDateWithoutTime, getStartAndEndOfMonth } from "@/utils/date_utils";
import dayjs from "dayjs";
import { formatRupiah } from "@/utils/format_rupiah";
import { QualityReportList } from "@/type/reportIssue";
import { printQualityReportPdf } from "@/utils/printQualityReportPdf";



type QualityReportResponse = {
    success: boolean;
    data: {
        purchase_orders: Array<{
            id: number;
            invoice_number: string;
        }>;
        inspectors: number[];
        receivers: string[];
        actions: string[];
        data: Pagination<QualityReportList>;
        summary: {
            total_reports: number;
            total_items_received: number;
            total_defects: number;
            average_defect_percentage: number;
            total_received_value: number;
        };
    };
};

type FilterState = {
    purchase_order_id?: number[];
    inspector_id?: number[];
    receiver_name?: string[];
    action?: string[];
};

const { RangePicker } = DatePicker;

const Checking: React.FC = () => {
    const [requestParam, setRequestParam] = useState<NewRequestParam>({
        table: 'quality_reports',
        request_column: [],
        limit: 10,
        page: 1,
        where: {}
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [qualityReports, setQualityReports] = useState<Pagination<QualityReportList>>();
    const [summary, setSummary] = useState({
        total_reports: 0,
        total_items_received: 0,
        total_defects: 0,
        average_defect_percentage: 0,
        total_received_value: 0
    });
    
    // Filter options from API
    const [filterOptions, setFilterOptions] = useState({
        purchase_orders: [] as Array<{ id: number; invoice_number: string }>,
        inspectors: [] as number[],
        receivers: [] as string[],
        actions: [] as string[],
    });
    
    // Active filters
    const [activeFilters, setActiveFilters] = useState<FilterState>({});
    
    const [currentStartDate, setCurrentStartDate] = useState<string>(getStartAndEndOfMonth().startOfMonth);
    const [currentEndDate, setCurrentEndDate] = useState<string>(getStartAndEndOfMonth().endOfMonth);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    
    const [checkedListColumn, setColumns] = useState<string[]>([
        'no',
        'invoice_number',
        'vendor_name',
        'inspection_date',
        'receiver_name',
        'total_received',
        'total_defect',
        'defect_percentage',
        'action',
        'created_at',
        'action_column'
    ]);
    
    // Available columns for quality reports
    const availableColumns: TableColumnsType<QualityReportList> = [
        {
            title: 'No',
            dataIndex: 'no',
            key: 'no',
            width: 50,
            render: (_: any, __: QualityReportList, index: number) => {
                const currentPage = qualityReports?.current_page || 1;
                const pageSize = qualityReports?.per_page || 10;
                return (currentPage - 1) * pageSize + index + 1;
            },
        },
        {
            title: 'Unique Code',
            dataIndex: 'unique_id',
            key: 'unique_id',
            width: 150,
            render: (_: any,record: QualityReportList, index: number) => <Typography.Link href={`/checking/${record.id}`}>{record.unique_id}</Typography.Link>,
        },
        {
            title: 'No Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Select
                        mode="multiple"
                        placeholder="Filter Invoice"
                        value={selectedKeys}
                        onChange={(value) => setSelectedKeys(value)}
                        style={{ width: 200, marginBottom: 8, display: 'block' }}
                        options={filterOptions.purchase_orders.map(po => ({
                            label: po.invoice_number,
                            value: po.id.toString()
                        }))}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ),
            onFilter: (value, record) => {
                return activeFilters.purchase_order_id?.includes(record.purchase_order_id) || false;
            },
            render: (invoice_number: string, record: QualityReportList) => (
                <Typography.Link 
                    href={`/purchase/${record.purchase_order_id}`}
                    title="Lihat Purchase Order"
                >
                    {invoice_number}
                </Typography.Link>
            ),
        },
        {
            title: 'Vendor',
            dataIndex: 'vendor_name',
            key: 'vendor_name',
            sorter: true,
            render: (vendor_name: string, record: QualityReportList) => (
                <Tooltip title={`${record.vendor_email} | ${record.vendor_phone}`}>
                    <div>
                        <div><ShopOutlined /> {vendor_name}</div>
                        <div className="text-xs text-gray-500 truncate">{record.vendor_email}</div>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Tanggal Pemeriksaan',
            dataIndex: 'inspection_date',
            key: 'inspection_date',
            sorter: true,
            width: 200,
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    {formatDateWithoutTime(date)}
                </Space>
            ),
        },
        {
            title: 'Diterima Oleh',
            dataIndex: 'receiver_name',
            key: 'receiver_name',
            sorter: true,
            width: 200,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Select
                        mode="multiple"
                        placeholder="Filter Penerima"
                        value={selectedKeys}
                        onChange={(value) => setSelectedKeys(value)}
                        style={{ width: 200, marginBottom: 8, display: 'block' }}
                        options={filterOptions.receivers.map(receiver => ({
                            label: receiver,
                            value: receiver
                        }))}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ),
            onFilter: (value, record) => {
                return activeFilters.receiver_name?.includes(record.receiver_name) || false;
            },
            render: (receiver: string) => (
                <div>
                    <UserOutlined /> {receiver}
                </div>
            ),
        },
        {
            title: 'Diperiksa Oleh',
            dataIndex: 'inspection_name',
            key: 'inspection_name',
            sorter: true,
            width: 200,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Select
                        mode="multiple"
                        placeholder="Filter Inspektor"
                        value={selectedKeys}
                        onChange={(value) => setSelectedKeys(value)}
                        style={{ width: 200, marginBottom: 8, display: 'block' }}
                        options={filterOptions.inspectors.map(inspector => ({
                            label: `User ${inspector}`,
                            value: inspector.toString()
                        }))}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ),
            onFilter: (value, record) => {
                return activeFilters.inspector_id?.includes(record.inspected_by) || false;
            },
            render: (inspection_name: string) => (
                <Tag color="blue">{inspection_name}</Tag>
            ),
        },
        {
            title: 'Diterima',
            dataIndex: 'total_received',
            key: 'total_received',
            align: 'right',
            sorter: true,
            width: 100,
            render: (total: number) => (
                <Badge 
                    count={total} 
                    style={{ backgroundColor: '#52c41a' }}
                    showZero
                />
            ),
        },
        {
            title: 'Issue',
            dataIndex: 'total_defect',
            key: 'total_defect',
            width: 100,
            align: 'right',
            sorter: true,
            render: (total: number, record: QualityReportList) => (
                <Badge 
                    count={total} 
                    style={{ 
                        backgroundColor: total > 0 ? '#f5222d' : '#52c41a'
                    }}
                    showZero
                />
            ),
        },
        {
            title: '% Issue',
            dataIndex: 'defect_percentage',
            key: 'defect_percentage',
            
            align: 'center',
            sorter: (a, b) => parseFloat(a.defect_percentage) - parseFloat(b.defect_percentage),
            render: (percentage: string) => {
                const percent = parseFloat(percentage);
                let color = 'green';
                let status = 'Baik';
                
                if (percent >= 5) {
                    color = 'red';
                    status = 'Kritis';
                } else if (percent >= 2) {
                    color = 'orange';
                    status = 'Waspada';
                }
                
                return (
                    <Tooltip title={`Status: ${status}`}>
                        <Tag color={color} style={{ minWidth: '70px' }}>
                            {percentage}%
                        </Tag>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Jumlah Item',
            dataIndex: 'items_count',
            key: 'items_count',
            width: 100,
            align: 'center',
            render: (count: number) => (
                <Tag color="blue">{count} Items</Tag>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Select
                        mode="multiple"
                        placeholder="Filter Action"
                        value={selectedKeys}
                        onChange={(value) => setSelectedKeys(value)}
                        style={{ width: 200, marginBottom: 8, display: 'block' }}
                        options={filterOptions.actions.map(action => ({
                            label: action.charAt(0).toUpperCase() + action.slice(1),
                            value: action
                        }))}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button
                            onClick={() => {
                                clearFilters?.();
                                confirm();
                            }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: (filtered: boolean) => (
                <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            ),
            onFilter: (value, record) => {
                return activeFilters.action?.includes(record.action) || false;
            },
            render: (action: string, record: QualityReportList) => {
                let color = 'default';
                let icon = <SyncOutlined />;
                
                switch(action) {
                    case 'replace':
                        color = 'orange';
                        icon = <SyncOutlined />;
                        break;
                    case 'repair':
                        color = 'blue';
                        icon = <SyncOutlined />;
                        break;
                    case 'accept':
                        color = 'green';
                        icon = <CheckCircleOutlined />;
                        break;
                    case 'reject':
                        color = 'red';
                        icon = <CloseCircleOutlined />;
                        break;
                    case 'return':
                        color = 'purple';
                        icon = <SyncOutlined />;
                        break;
                }
                
                return (
                    <Tag color={color} icon={icon}>
                        {action.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Catatan',
            dataIndex: 'action_note',
            key: 'action_note',
            width: 250,
            ellipsis: true,
            render: (note: string) => (
                <Tooltip title={note}>
                    <Typography.Text ellipsis>
                        {note || '-'}
                    </Typography.Text>
                </Tooltip>
            ),
        },
        {
            title: 'Dibuat',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            sorter: true,
            render: (date: string) => (
                <Space direction="vertical" size={0}>
                    <div><CalendarOutlined /> {formatDateWithoutTime(date)}</div>
                </Space>
            ),
        },
        {
            title: 'Aksi',
            key: 'action_column',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: QualityReportList) => (
                <Dropdown menu={{
                    items: [
                        {
                            key: 'view',
                            label: (
                                <Button 
                                    type="link" 
                                    icon={<EyeOutlined />}
                                    href={`/checking/${record.id}`}
                                    block
                                >
                                    Detail
                                </Button>
                            ),
                        },
                        {
                            key: 'edit',
                            label: (
                                <Button 
                                    type="link" 
                                    icon={<SettingFilled />}
                                    href={`/checking/${record.id}/edit`}
                                    block
                                >
                                    Edit
                                </Button>
                            ),
                        },
                        
                        {
                            key: 'print',
                            label: (
                                <Button 
                                    type="link" 
                                    icon={<FileTextOutlined />}
                                    onClick={() => printPDF(record.id)}
                                    block
                                >
                                    Cetak
                                </Button>
                            ),
                        },
                        {
                            key: 'delete',
                            label: (
                                <Popconfirm
                                    title="Yakin ingin menghapus?"
                                    onConfirm={() => handleDelete([record.id])}
                                >
                                    <Button type="link" danger icon={<DeleteOutlined />}>Hapus</Button>
                                </Popconfirm>
                            ),
                        },
                    ]
                }}>
                    <SettingFilled style={{ cursor: 'pointer', fontSize: '16px' }} />
                </Dropdown>
            ),
        },
    ];

    const printPDF = async (id: number) => {
        
        
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/quality-reports/${id}`);
            if (response.status === 200) {
                printQualityReportPdf(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengambil data laporan kualitas');
        } finally {
            setLoading(false);
        }
    }

    const filteredColumns = availableColumns.filter((column) =>
        checkedListColumn.includes(column.key!.toString())
    );

    // Handle table changes
    const onChange: TableProps<QualityReportList>['onChange'] = (pagination, filters, sorter) => {
        const request = { ...requestParam };
        
        // Update active filters
        const newFilters: FilterState = {};
        
        if (filters.purchase_order_id) {
            newFilters.purchase_order_id = filters.purchase_order_id.map(id => parseInt(id as string));
        }
        if (filters.inspected_by) {
            newFilters.inspector_id = filters.inspected_by.map(id => parseInt(id as string));
        }
        if (filters.receiver_name) {
            newFilters.receiver_name = filters.receiver_name as string[];
        }
        if (filters.action) {
            newFilters.action = filters.action as string[];
        }
        
        setActiveFilters(newFilters);
        
        // Handle sorting
        if (sorter && !Array.isArray(sorter) && sorter.columnKey) {
            request.orderBy = {
                [sorter.columnKey.toString()]: sorter.order === "ascend" ? 'ASC' : 'DESC'
            };
        }

        // Handle pagination
        if (pagination.current) {
            request.page = pagination.current;
        }
        if (pagination.pageSize) {
            request.limit = pagination.pageSize;
        }

        setRequestParam(request);
        getQualityReports(request);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    // Get quality reports from API
    const getQualityReports = async (request?: NewRequestParam) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post<QualityReportResponse>(
                '/quality-reports/search', 
                request ?? requestParam
            );

            if (response.data.success) {
                const responseData = response.data.data;
                setQualityReports(responseData.data);
                setSummary(responseData.summary);
                setFilterOptions({
                    purchase_orders: responseData.purchase_orders,
                    inspectors: responseData.inspectors,
                    receivers: responseData.receivers,
                    actions: responseData.actions,
                });
            } else {
                message.error('Gagal mengambil data quality reports');
            }
        } catch (error: any) {
            message.error(error.message || 'Terjadi kesalahan');
            console.error('Error fetching quality reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle date range change
    const onChangeRangePicker = (dates: [string, string]) => {
        let range: [string, string] = dates;

        if (dates[0] === '' && dates[1] === '') {
            const { startOfMonth, endOfMonth } = getStartAndEndOfMonth();
            range = [startOfMonth, endOfMonth];
        } else {
            range = [`${range[0]} 00:00:00`, `${range[1]} 23:59:59`];
        }

        setCurrentStartDate(range[0]);
        setCurrentEndDate(range[1]);
        
        const request = { ...requestParam };
        request.where = {
            ...request.where,
            inspection_date: ['between', range]
        };
        
        setRequestParam(request);
        getQualityReports(request);
    };

    // Handle search
    const onSearch = (query: string) => {
        const request = { ...requestParam };
        if (query.trim()) {
            request.keyword = query;
        } else {
            delete request.keyword;
        }
        setRequestParam(request);
        getQualityReports(request);
    };

    // Handle export to Excel
    const onExport = async () => {
        const request = { ...requestParam, type: 'export' };
        setLoading(true);
        
        try {
            const response = await axiosInstance.post('/quality-reports/search', request, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const date = new Date();
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `quality_reports_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            message.success('Export berhasil');
        } catch (error: any) {
            message.error(error.message || 'Gagal mengexport data');
        } finally {
            setLoading(false);
        }
    };

    // Handle column selection
    const handleColumnChange = (values: string[]) => {
        setColumns(values);
    };

    // Handle items per page change
    const handleShowRecord = (value: string) => {
        const request = { ...requestParam, limit: parseInt(value) };
        setRequestParam(request);
        getQualityReports(request);
    };

    // Handle pagination change
    const onChangePagination = (page: number) => {
        const request = { ...requestParam, page };
        setRequestParam(request);
        getQualityReports(request);
    };

    // Handle print report
    const handlePrintReport = (record: QualityReportList) => {
        Modal.info({
            title: 'Cetak Laporan Quality',
            content: `Mencetak laporan quality untuk invoice ${record.invoice_number}`,
            okText: 'Cetak',
            cancelText: 'Batal',
            onOk: () => {
                window.open(`/quality/reports/${record.id}/print`, '_blank');
            },
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setActiveFilters({});
        const request = { ...requestParam };
        delete request.where?.purchase_order_id;
        delete request.where?.inspected_by;
        delete request.where?.receiver_name;
        delete request.where?.action;
        setRequestParam(request);
        getQualityReports(request);
    };

    // Range presets for date picker
    const rangePresets: TimeRangePickerProps['presets'] = [
        { label: '7 Hari Terakhir', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: '14 Hari Terakhir', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: '30 Hari Terakhir', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: '90 Hari Terakhir', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];


    const handleDelete = async (ids: number[]) => {
        if (ids.length <= 0) {
            message.error("Pilih data untuk dihapus!");
            return;
        }

        setLoading(true);
        try {
            const res = await axiosInstance.post(`/quality-reports/bulk-delete`, {
                report_ids: ids,
            });
            if (res.status === 200) {
                message.success("Berhasil dihapus!");
                getQualityReports(requestParam);
                setSelectedRowKeys([]);
            }
        } catch (err) {
            message.error("Gagal menghapus data!");
        } finally {
            setLoading(false);
        }
    }

    // Count active filters
    const activeFilterCount = Object.values(activeFilters).filter(f => f && f.length > 0).length;

    // Initial load
    useEffect(() => {
        const request = {
            ...requestParam,
            where: {
                inspection_date: ['between', [currentStartDate, currentEndDate]]
            },
            orderBy: {
                created_at: "DESC"
            }
        };
        setRequestParam(request);
        getQualityReports(request);
    }, []);

    return (
        <DashboardLayout>
            {/* Action Buttons */}
            <Space className="gap-3 w-full mb-6">
                <Button 
                    icon={<PlusOutlined />} 
                    type="primary" 
                    href="/checking/add"
                >
                    Pengecekan Barang
                </Button>
                <Button 
                    icon={<ReloadOutlined />} 
                    type="default" 
                    onClick={() => getQualityReports(requestParam)}
                    loading={loading}
                >
                    Refresh
                </Button>
                
                {selectedRowKeys.length > 0 && (
                    <Space>
                        <Typography.Text type="secondary">
                            {selectedRowKeys.length} item dipilih
                        </Typography.Text>
                        <Button 
                            type="dashed" 
                            icon={<FileExcelFilled />}
                            onClick={onExport}
                        >
                            Export Terpilih
                        </Button>
                    </Space>
                )}
                {selectedRowKeys.length > 0 && (
                <Popconfirm
                    title="Yakin ingin menghapus?"
                    onConfirm={() => handleDelete(selectedRowKeys as number[])}
                >
                    <Button type="primary" danger>Hapus</Button>
                </Popconfirm>
                )}
            </Space>

            {/* Summary Cards */}
            <Row gutter={16} className="my-6">
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Total Laporan" 
                            value={summary.total_reports} 
                            prefix={<FileTextOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Total Item Diperiksa" 
                            value={summary.total_items_received} 
                            prefix={<CheckCircleOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Total Issue" 
                            value={summary.total_defects} 
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: summary.total_defects > 0 ? '#f5222d' : '#52c41a' }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic 
                            title="Rata-rata % Issue" 
                            value={summary.average_defect_percentage ?? 0} 
                            suffix="%"
                            precision={2}
                            valueStyle={{ 
                                color: summary.average_defect_percentage >= 5 ? '#f5222d' : 
                                       summary.average_defect_percentage >= 2 ? '#fa8c16' : '#52c41a'
                            }}
                            loading={loading}
                        />
                    </Card>
                </Col>
                
            </Row>

            {/* Filters */}
            <Space className="gap-3 mb-4" wrap>
                <Typography.Text strong>Filter:</Typography.Text>
                <RangePicker 
                    presets={rangePresets}
                    defaultPickerValue={[dayjs(currentStartDate), dayjs(currentEndDate)]}
                    defaultValue={[dayjs(currentStartDate), dayjs(currentEndDate)]}
                    onChange={(_, dateString) => onChangeRangePicker(dateString as [string, string])}
                    format="DD/MM/YYYY"
                    placeholder={['Dari Tanggal', 'Sampai Tanggal']}
                />
                
                {activeFilterCount > 0 && (
                    <Button 
                        type="link" 
                        onClick={clearAllFilters}
                    >
                        Hapus Filter ({activeFilterCount})
                    </Button>
                )}
                
                <Button 
                    type="default" 
                    icon={<FileExcelFilled />} 
                    onClick={onExport}
                    loading={loading}
                >
                    Export Excel
                </Button>
                
                <Select
                    defaultValue="10"
                    style={{ width: 80 }}
                    onChange={handleShowRecord}
                    options={[
                        { value: '10', label: '10' },
                        { value: '30', label: '30' },
                        { value: '50', label: '50' },
                        { value: '100', label: '100' },
                    ]}
                />
                
                <Input 
                    placeholder="Cari invoice, vendor, atau penerima..." 
                    onChange={(e) => onSearch(e.target.value)} 
                    prefix={<SearchOutlined />} 
                    style={{ width: 300 }}
                    allowClear
                />
            </Space>


            {/* Data Table */}
            <Table
                columns={availableColumns}
                dataSource={qualityReports?.data}
                rowKey={(record) => record.id.toString()}
                loading={loading}
                onChange={onChange}
                scroll={{ x: 'max-content', y: 600 }}
                pagination={false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: onSelectChange,
                }}
                size="middle"
                bordered
            />

            {/* Pagination */}
            {qualityReports && (
                <div className="flex my-4 justify-between items-center">
                    
                    <AntPagination 
                        current={qualityReports.current_page}
                        total={qualityReports.total}
                        pageSize={qualityReports.per_page}
                        onChange={onChangePagination}
                        showSizeChanger={false}
                        showQuickJumper
                    />
                </div>
            )}
        </DashboardLayout>
    );
};

export default Checking;