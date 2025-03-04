import DashboardLayout from "@/pages/component/DashboardLayout";
import { InventoryMovement } from "@/type/inventory_movement";
import { Mutation } from "@/type/mutation";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatDate } from "@/utils/date_utils";
import { Breadcrumb, Card, List, message, Tag, Typography } from "antd";
import Title from "antd/es/typography/Title";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    ArrowRightOutlined,
} from '@ant-design/icons';
const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};

const DetailMutation: React.FC = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const router = useRouter();
    const [mutation, setData] = useState<Mutation>();
    const [loading, setLoading] = useState<boolean>(false);



    const fetch = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/mutations/${slug}`);
            if(response.status == 200){
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (router.isReady) {
            setSlug(router.query.slug as string);
        }
        
    }, [router.isReady, router.query.slug]);

    useEffect(() => {
        if(slug){
            fetch();
        }
    }, [slug]);

    return (
        <DashboardLayout>
            <Breadcrumb
                separator=">"
                className="mb-4"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Daftar Mutasi',
                        href: '/inventory/mutasi',
                    },
                    {
                        title: `${mutation?.product_name}`,
                    }
                ]}
            />
            <Card title={`Rincian Mutasi `}>
                <Card.Grid hoverable={false} style={gridStyle}>Nama Barang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>SKU</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.sku}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Barcode</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.product?.barcode}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Tanggal</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatDate(mutation?.created_at!)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Jumlah</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.quantity}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Dibuat Oleh</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.user?.name ?? '-'}</Card.Grid>
            </Card>

            <List
                className="mt-5"
                header={<div className="text-lg font-bold">History</div>}
                bordered
                dataSource={mutation?.items}
                renderItem={(item) => (
                    <List.Item>
                        {item.movement?.type == 'out' && <div className="flex gap-3"><Typography.Text mark>[{item?.quantity} {item?.unit_name}]</Typography.Text> <Tag color="#108ee9">{item?.product_name}</Tag> Keluar Dari {item?.from_name} ({formatDate(item.created_at)})</div> }
                        {item.movement?.type == 'in' && <div className="flex gap-3"><Typography.Text mark>[{item?.quantity} {item?.unit_name}]</Typography.Text> <Tag color="#108ee9">{item?.product_name}</Tag> {item?.from_name} <ArrowRightOutlined /> {item?.to_name} ({formatDate(item.created_at)}) </div>}
                    </List.Item>
                )}
            />
        </DashboardLayout>
    );
}

export default DetailMutation;