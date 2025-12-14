import { useEffect, useState } from "react";
import {
    Button,
    Input,
    message,
    Space,
    Table,
    Typography,
    Popconfirm,
    Pagination as AntPagination,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import DashboardLayout from "../component/DashboardLayout";
import axiosInstance from "@/utils/axiosInstance";
import { setCookie } from "cookies-next";
import Title from "antd/es/typography/Title";
import { TableProps, TableColumnsType } from "antd";
import { Pagination } from "@/type/pagination";
import { NewRequestParam } from "@/type/request_param";
import { Vendor } from "@/type/vendor";
import Link from "next/link";


type OnChange = NonNullable<TableProps<Vendor>["onChange"]>;
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

const Vendors = () => {
    const [vendors, setVendors] = useState<Pagination<Vendor>>();
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [requestParam, setRequestParam] = useState<NewRequestParam>({
        table: "",
        orderBy: {
            created_at: "DESC",
        },
        limit: 10,
        page: 1,
    });

    const handleSearch = (value: string) => {
        const req = { ...requestParam };
        req.page = 1;
        req.keyword = value;

        setRequestParam(req);
        fetchVendors();
    };

    const handleEdit = (id: number) => {
        setCookie("vendor_id", id);
        window.location.href = "/vendor/add";
    };

    const newVendor = () => {
        setCookie("vendor_id", null);
        
        window.location.href = "/vendor/add";
    };

    const handleDelete = async (ids: number[]) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/vendors/bulk-delete`, {
                ids: ids,
            });

            if (response.status === 200) {
                message.success("Vendor berhasil dihapus!");
                fetchVendors();
            } else {
                message.error("Gagal menghapus vendor!");
            }
        } catch (err) {
            message.error("Terjadi kesalahan saat menghapus vendor!");
        } finally {
            setLoading(false);
        }
    };

    const onChangeSelect = (keys: React.Key[]) => {
        setSelectedRowKeys(keys);
    };

    const columns: TableColumnsType<Vendor> = [
        {
            title: "No",
            dataIndex: "",
            key: "index",
            render: (_: any, __: any, index: number) => index + 1,
            width: 60
        },
        {
            title: "Nama Vendor",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },
        {
            title: "Alamat",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Telepon",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Aksi",
            key: "action",
            render: (text: any, record: Vendor) => (
                <div className="flex gap-3">
                    <Button type="link" className="text-yellow-500" onClick={() => handleEdit(record.id)}>
                        Edit
                    </Button>

                    <Popconfirm
                        title="Hapus Vendor"
                        description="Yakin ingin menghapus vendor ini?"
                        okText="Hapus"
                        cancelText="Batal"
                        onConfirm={() => handleDelete([record.id])}
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const onChange: TableProps<Vendor>["onChange"] = (
        pagination,
        filters,
        sorter
    ) => {
        const sort = sorter as Sorts;

        const req = { ...requestParam };
        if (sort.columnKey !== undefined) {
            req.orderBy = {
                [sort.columnKey.toString()]:
                    sort.order === "ascend" ? "ASC" : "DESC",
            };
        }

        setRequestParam(req);
        fetchVendors();
    };

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post("/vendors/search", requestParam);
            console.log(res.status)
            console.log(res.data.data.data);
            if (res.status === 200) {
                setVendors(res.data.data);
            } else {
                message.error("Gagal mengambil data vendor");
            }
        } catch (err) {
            message.error("Gagal mengambil data vendor!");
        } finally {
            setLoading(false);
        }
    };

    const onChangePagination = (page: number) => {
        const req = { ...requestParam };
        req.page = page;

        setRequestParam(req);
        fetchVendors();
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    return (
        <DashboardLayout>
            <div>
                <Title level={2}>Daftar Vendor</Title>

                <Space style={{ marginBottom: 16 }}>
                    <Input
                        prefix={<SearchOutlined />}
                        style={{ width: 350 }}
                        placeholder="Cari Berdasarkan Nama, Email, atau Telepon"
                        onChange={(e) => handleSearch(e.target.value)}
                    />

                    <Button type="primary" onClick={newVendor}>
                        Vendor Baru
                    </Button>

                    <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        onClick={() => fetchVendors()}
                    >
                        Reload
                    </Button>

                    {selectedRowKeys.length > 0 && (
                        <Popconfirm
                            title="Hapus Vendor"
                            description="Data yang dihapus tidak dapat dikembalikan"
                            okText="Hapus"
                            cancelText="Batal"
                            onConfirm={() =>
                                handleDelete(selectedRowKeys as number[])
                            }
                        >
                            <Button type="primary" danger>
                                Hapus
                            </Button>
                        </Popconfirm>
                    )}
                </Space>

                <Table
                    dataSource={vendors?.data}
                    columns={columns}
                    loading={loading}
                    onChange={onChange}
                    rowKey={(record) => record.id}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onChangeSelect,
                    }}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                />

                <div className="flex justify-end my-3">
                    <AntPagination
                        defaultCurrent={vendors?.current_page}
                        total={vendors?.total}
                        onChange={onChangePagination}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Vendors;
