import { Pagination } from "@/type/pagination";
import axiosInstance from "./axiosInstance";
import { message } from "antd";
import { Item } from "@/type/item";

export async function getLocation() {
    try {
         const param = {
            table: 'location',
            page: 1,
            limit: 10,
            request_column:['location_id','name'],
            request_column_relation: []
        }

        axiosInstance.post('/search', param).then((response) => {
            if(response.status == 200){
                const locations: Pagination<Location> = response.data.data;
                return locations.data;
            }else{
                [];
            }
        })
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}
export async function getSKU() {
    try {
         const param = {
            table: 'product',
            page: 1,
            // limit: 50,
            request_column:['sku'],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const items: Item[] = response.data.data;
            return items;
        }else{
            [];
        }
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}