import DashboardLayout from "@/pages/component/DashboardLayout";
import DetailMovement from "@/pages/component/DetailMovement";
import { InventoryMovement } from "@/type/inventory_movement";
import { RequestParam } from "@/type/request_param";
import axiosInstance from "@/utils/axiosInstance";
import { Breadcrumb, message, Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const DetailInventoryIn = () => {
    const [inventory, setInventory] = useState<InventoryMovement>();
    const [slug, setSlug] = useState<string | undefined>(undefined);
    const [requestParam, setParamRequst] = useState<RequestParam>({
            table: 'inventory_movements',
            limit: 1,
            page: 1,
            where: [{
                id: '',
            }],
            // whereHas: {
            //     "movements.mutation_history": {
            //         type: "mutation",
            //     },
            // },
            request_column_relation: ['inventory', 'inventory.location'],
    });

    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const fetchDetail = async () => {
        setLoading(true);
        try {
            requestParam.where = [{
                id: slug,
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
            <Spin spinning={loading}>
                <Breadcrumb
                    separator=">"
                    className="mb-4"
                    items={[
                        {
                            title: 'Home',
                        },
                        {
                            title: 'Barang Masuk',
                            href: '/inventory/in',
                        },
                        {
                            title: `${inventory?.product_name}`,
                        }
                    ]}
                />
            </Spin>
            <DetailMovement movement={inventory!} title="Detail Barang Keluar" />
        </DashboardLayout>
    )
}

export default DetailInventoryIn;