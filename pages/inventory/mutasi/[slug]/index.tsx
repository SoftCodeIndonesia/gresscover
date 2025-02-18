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

const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};

const DetailMutation: React.FC = () => {
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [mutation, setData] = useState<Mutation>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const [requestParam, setParamRequst] = useState<RequestParam>({
        table: 'mutations',
        limit: 1,
        page: 1,
        where: [{
            id: '',
        }],
        request_column_relation: ["items"]
    });


    const fetch = async () => {
        setLoading(true);
        try {
            requestParam.where = [{
                mutation_id: slug,
            }];
            const response = await axiosInstance.post('/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);
                if(response.data.data.data.length > 0){
                    setData(response.data.data.data[0]);
                }
                
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
            {/* <Card title={`Rincian Mutasi `}>
                
                <Card.Grid hoverable={false} style={gridStyle}>Nama Barang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Tanggal</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{formatDate(mutation?.created_at!)}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Jumlah</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{mutation?.quantity} {mutation?.unit_name}</Card.Grid>
            </Card> */}

            <List
                className="mt-5"
                header={<div className="text-lg font-bold">History</div>}
                bordered
                dataSource={mutation?.items}
                renderItem={(item) => (
                    <List.Item>
                    <Typography.Text mark>[{item?.quantity} {item?.unit_name}]</Typography.Text> <Tag color="#108ee9">{item?.product_name}</Tag> Keluar Ke {item?.to_name} ({formatDate(item.created_at)}) </List.Item>
                )}
            />
        </DashboardLayout>
    );
}

export default DetailMutation;