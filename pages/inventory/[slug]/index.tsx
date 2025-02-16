import { Breadcrumb, Card, List, message, Tag, Tree, TreeDataNode, TreeProps, Typography } from "antd";
import DashboardLayout from "../../component/DashboardLayout";
import { useEffect, useState } from "react";
import { Inventory } from "@/type/inventory";
import { useRouter } from "next/router";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { formatRupiah } from "@/utils/format_rupiah";
import { DownOutlined } from '@ant-design/icons';
const gridStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: '10px'
};
const DetailInventory: React.FC = () => {
    const [inventory, setInventory] = useState<Inventory>();
    const [loading, setLoading] = useState<boolean>(false);
    const [slug, setSlug] = useState<string | undefined>(undefined);

    const [requestParam, setParamRequst] = useState<RequestParam>({
            table: 'inventory',
            limit: 1,
            page: 1,
            where: [{
                sale_id: '',
            }],
            // whereHas: {
            //     "movements.mutation_history": {
            //         type: "mutation",
            //     },
            // },
            request_column_relation: ['movements', 'location', 'movements.mutation_history'],
    });

    const router = useRouter();

    const fetchDetail = async () => {
        setLoading(true);
        try {
            requestParam.where = [{
                inventory_id: slug,
            }];
            const response = await axiosInstance.post('/search', requestParam);
            if(response.status == 200){
                // console.log(response.data.data.data);
                if(response.data.data.data.length > 0){
                    setInventory(response.data.data.data[0]);
                }
                
            }
        } catch (error: any) {
            message.error(`${error.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    }

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    const toTreeData = () => {
        const data: TreeDataNode[] = inventory?.movements.map((value, index) => {
            return {
                className: index == 0 ? "mt-5" : "",
                key: index,
                title: (value.type == 'in' || value.type == 'adjustment' ? 'Masuk' : 'Keluar') + `(${value.quantity} ${value.unit_name})`,
                children: value.mutation_history?.map((mutation, indexChild) => {
                    return {
                        key: indexChild,
                        title: mutation.type == 'in' || mutation.type == 'adjustment' ? 'Masuk' : 'Keluar' + `(${mutation.quantity} ${mutation.unit_name})`,
                    }
                }),
            }
        }) ?? [];

        console.log(data);

        return data;
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
            <Breadcrumb
                separator=">"
                className="mb-4"
                items={[
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Semu Barang',
                        href: '/inventory',
                    },
                    {
                        title: `${inventory?.product_name}`,
                    }
                ]}
            />
            <Card title={`Detail Product `}>
                
                <Card.Grid hoverable={false} style={gridStyle}>Nama Barang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.product_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Gudang</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.location?.name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Stok Saat Ini</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>{inventory?.quantity} {inventory?.unit_name}</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Beli</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-red-500">{formatRupiah(inventory?.cost ?? 0)}</p></Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}>Harga Jual</Card.Grid>
                <Card.Grid hoverable={false} style={gridStyle}><p className="text-green-500">{formatRupiah(inventory?.price ?? 0)}</p></Card.Grid>
            </Card>
            {/* <Tree
                autoExpandParent={true}
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={['0']}
                onSelect={onSelect}
                treeData={toTreeData()}
            /> */}
            <List
                className="mt-5"
                header={<div className="text-lg font-bold">History</div>}
                bordered
                dataSource={inventory?.movements}
                renderItem={(item) => (
                    <List.Item>
                    <Typography.Text mark>[{item?.product_name}]</Typography.Text> <Tag color="#108ee9">{item?.quantity} {item?.unit_name}</Tag> {item.type == 'in' || item.type == 'adjustment' ? 'Masuk' : item.type == 'out' ? 'Keluar' : 'Mutasi'} {item?.inventory?.location?.name} <p className="italic">{item.note}</p> </List.Item>
                )}
            />
        </DashboardLayout>
    );
}

export default DetailInventory;