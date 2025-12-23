"use client";

import { Key, useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  TableColumnsType,
  TableProps,
  Tag,
  Card,
  Typography,
  Pagination
} from "antd";

import axiosInstance from "@/utils/axiosInstance";
import DashboardLayout from "../component/DashboardLayout";
import EditButton from "../component/EditButton";
import DeleteButton from "../component/DeleteButton";

import {
  ReloadOutlined,
  PlusOutlined,
  FileExcelFilled,
  SearchOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { setCookie } from "cookies-next";
import { formatRupiah } from "@/utils/format_rupiah";
import { PurchaseOrder, PurchaseOrderStatus } from "@/type/purchase";
import { Pagination as CustomPagination } from "@/type/pagination";
import { getStartAndEndOfMonth } from "@/utils/date_utils";
import { NewRequestParam } from "@/type/request_param";
import { printPurchaseOrder } from "@/utils/printPurchaseOrderPdf";

const { RangePicker } = DatePicker;

type OnChange = NonNullable<TableProps<PurchaseOrder>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;




// MAIN PAGE
export default function PurchaseOrderIndex() {
  const [purchaseOrders, setPurchaseOrders] =
    useState<CustomPagination<PurchaseOrder>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [vendorFilter, setVendorFilter] = useState<{id: number,name: string}[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const [requestParam, setRequestParam] = useState<NewRequestParam>({
    table: "purchase_orders",
    request_column: [],
    limit: 10,
    page: 1,
    orderBy: {
      created_at: "DESC",
    },
    type: 'search',
    where: {},
  });

  const [currentStartDate, setCurrentStartDate] = useState<string>(
    dayjs().startOf("month").format("YYYY-MM-DD 00:00:00")
  );
  const [currentEndDate, setCurrentEndDate] = useState<string>(
    dayjs().endOf("month").format("YYYY-MM-DD 23:59:00")
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // STATUS TAG
  const showStatus = (status: string) => {
    if (status === "completed") return <Tag color="green">SELESAI</Tag>;
    if (status === "pending") return <Tag color="orange">PENDING</Tag>;
    if (status === "cancel") return <Tag color="red">BATAL</Tag>;
    if (status === "received") return <Tag color="blue">DITERIMA</Tag>;
    return <Tag color="default">DRAFT</Tag>;
  };

  // COLUMNS
  const columns: TableColumnsType<PurchaseOrder> = [
    {
      title: "No",
      dataIndex: "",
      key: "",
      render: (_: any, __: PurchaseOrder, index: number) => index + 1,
    },
    {
      title: "Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      render: (_: any, record: PurchaseOrder, index: number) => <Typography.Link href={`/purchase/${record.purchase_order_id}`}>{record.invoice_number}</Typography.Link>,
    },
    {
      title: "vendor_id",
      dataIndex: "vendor_name",
      key: "vendor_id",
      filters: vendorFilter.map((map) => ({text: map.name, value: map.id})),
    },
    {
      title: "Tanggal PO",
      dataIndex: "order_date",
      key: "order_date",
      sorter: true,
    },
    {
      title: "Jatuh Tempo",
      dataIndex: "due_date",
      key: "due_date",
      sorter: true,
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: true,
      render: (v) => formatRupiah(v),
    },
    {
      title: "Item",
      dataIndex: "items_count",
      key: "items_count",
      sorter: true,
    },
    {
      title: "Qty",
      dataIndex: "total_quantity",
      key: "total_quantity",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statusFilter.map((map) => ({text: map.toUpperCase(), value: map})),
      render: (v) => showStatus(v),
    },
    {
      title: "Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, item: PurchaseOrder) => (
        <>
          <EditButton
            href={`/purchase/add?id=${item.purchase_order_id}`}
            label="Edit"
            
          />
          <Button
            onClick={() => printPDF(item.purchase_order_id!)}
            type="link"
            icon={<PrinterOutlined/>}
          >Cetak PDF</Button>
          {item.status !== PurchaseOrderStatus.COMPLETED && <DeleteButton
            label="Hapus"
            onComfirm={() => handleDelete([item.purchase_order_id!])}
            okText="Hapus"
            cancelText="Batal"
          />}
        </>
      ),
    },
  ];

  // FUNCTIONS
  const getPurchaseOrders = async (params: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/purchase-orders/search",
        params
      );
      if (response.status === 200) {
        console.log('response ',response.data.data);
        setStatusFilter(response.data.data.statuses);
        setVendorFilter(response.data.data.vendors);
        setPurchaseOrders(response.data.data.data);
      }
    } catch (error: any) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const request_param = {...requestParam};
      request_param.type = 'export';
      const response = await axiosInstance.post(
        "/purchase-orders/search",
        request_param,{
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const date = new Date();
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `purchase-order${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    } catch (error: any) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const printPDF = async (id: number) => {
    setLoading(true);
      try {
          const response = await axiosInstance.get(`/purchase-orders/${id}`);
          if (response.status === 200) {
              printPurchaseOrder(response.data.data)
          }
      } catch (error: any) {
          message.error(error.response?.data?.message || 'Gagal mengambil data invoice');
      } finally {
          setLoading(false);
      }
  }
  

  const handleDelete = async (ids: number[]) => {
    if (ids.length <= 0) {
      message.error("Pilih data untuk dihapus!");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(`/purchase-orders/bulk-delete`, {
        ids: ids,
      });
      if (res.status === 200) {
        message.success("Berhasil dihapus!");
        getPurchaseOrders(requestParam);
        setSelectedRowKeys([]);
      }
    } catch (err) {
      message.error("Gagal menghapus data!");
    } finally {
      setLoading(false);
    }
  };

  const onChangeTable: TableProps<PurchaseOrder>["onChange"] = (
    _pagination,
    filters,
    sorter
  ) => {
    

    // SORTING
    const sort: Sorts = sorter as Sorts;
    console.log('short', sort);
    const request = {...requestParam};
    if(sort.columnKey != undefined){
      request.orderBy = {
        [sort.columnKey.toString()]: sort.order == "ascend" ? 'ASC' : 'DESC' 
      }
      
    }

    // FILTERS
    let filterColumn: any = {};
    for (let key in filters) {
      if (filters[key])
        filterColumn[key] = ["in", filters[key]] as any;
    }

    request.where = {
      ...filterColumn,
    //   created_at: ["between", [currentStartDate, currentEndDate]],
    };
// console.log('short', req);
    setRequestParam(request);
    getPurchaseOrders(request);
  };

  const onChangePagination = (page: number) => {
    const req = { ...requestParam };
    req.page = page;
    setRequestParam(req);
    getPurchaseOrders(req);
  };

  const onChangeRangePicker = (dates: [string, string]) => {
    var range: [string, string] = dates;
    
    console.log(range);

    if(dates[0] == '' && dates[1] == ''){
        const start = getStartAndEndOfMonth().startOfMonth;
        const end = getStartAndEndOfMonth().endOfMonth;
        range = [start, end];
    }else{
        range = [`${range[0]} 00:00:00`, `${range[1]} 23:59:00`];
    }

    setCurrentEndDate(range[1]);
    setCurrentStartDate(range[0]);
    const request = {...requestParam};
    
    request.where['order_date'] = ['between', range];
    setRequestParam(request);
    getPurchaseOrders(request);
  };

  const onSearch = (q: string) => {
    const req = { ...requestParam };
    req.keyword = q;
    setRequestParam(req);
    getPurchaseOrders(req);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: Key[]) => setSelectedRowKeys(keys),
  };

  const handelShowRecord = (limit: string) => {
    const req = { ...requestParam };
    req.limit = parseInt(limit);
    setRequestParam(req);
    getPurchaseOrders(req);
  };

  const checkExistCompletedData = (selected: Key[]) => {
    var result = true;
    (purchaseOrders?.data ?? []).forEach(element => {
      if(element.status == PurchaseOrderStatus.COMPLETED){
        const exist = selected.find((find) => find == element.purchase_order_id);
        if(exist){
          result = false;
          return;
        }
      }
    });
    return result;
  }

  // INIT
  useEffect(() => {
    const req = { ...requestParam };
    setRequestParam(req);
    getPurchaseOrders(req);
  }, []);

  return (
    <DashboardLayout>
      {/* ACTION BUTTONS */}
      <Space>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          href="/purchase/add"
          onClick={() => {
            setCookie("po_id", null);
           
          }}
        >
          Tambah
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => getPurchaseOrders(requestParam)}
        >
          Reload
        </Button>

        {selectedRowKeys.length > 0 && checkExistCompletedData(selectedRowKeys) && (
          <Popconfirm
            title="Yakin ingin menghapus?"
            onConfirm={() => handleDelete(selectedRowKeys as number[])}
          >
            <Button danger>Hapus</Button>
          </Popconfirm>
        )}
      </Space>

      {/* FILTER AREA */}
      <Space className="flex gap-3 my-5 items-center">
        <p>Filter Tanggal PO:</p>

        <RangePicker onChange={(e, dateString) => onChangeRangePicker(dateString)}  />

        <Button icon={<FileExcelFilled />} onClick={exportData}>Export Excel</Button>

        <Select
          defaultValue="10"
          style={{ width: 80 }}
          onChange={handelShowRecord}
          options={[
            { value: "10", label: "10" },
            { value: "30", label: "30" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
        />

        <Input
          placeholder="Cari PO"
          prefix={<SearchOutlined />}
          onChange={(e) => onSearch(e.target.value)}
        />
      </Space>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={purchaseOrders?.data ?? []}
        rowSelection={rowSelection}
        loading={loading}
        onChange={onChangeTable}
        pagination={false}
        rowKey="purchase_order_id"
        scroll={{ x: "max-content" }}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={purchaseOrders?.current_page}
          total={purchaseOrders?.total}
          onChange={onChangePagination}
        />
      </div>
    </DashboardLayout>
  );
}
