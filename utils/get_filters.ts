import { Pagination } from "@/type/pagination";
import axiosInstance from "./axiosInstance";
import { message } from "antd";
import { Item, ItemUnit } from "@/type/item";
import { Platform } from "@/type/platform";
import { Tax } from "@/type/tax";

export async function getUnitType() {
    try {
         const param = {
            table: 'unit',
            page: 1,
            limit: 10,
            request_column:['type_id','name', 'max_value', 'slug'],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const locations: Pagination<ItemUnit> = response.data.data;
            return locations.data;
        }else{
            [];
        }
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}
export async function getLocation() {
    try {
         const param = {
            table: 'location',
            page: 1,
            limit: 10,
            request_column:['location_id','name'],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const locations: Pagination<Location> = response.data.data;
            return locations.data;
        }else{
            [];
        }
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}
export async function getPlatforms() {
    try {
         const param = {
            table: 'platform',
            page: 1,
            limit: 10,
            request_column:['id','name','slug'],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const locations: Pagination<Platform> = response.data.data;
            return locations.data;
        }else{
            [];
        }
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}
export async function getBarcode() {
    try {
         const param = {
            table: 'product',
            page: 1,
            limit: 10,
            request_column:['barcode'],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const locations: Pagination<Item> = response.data.data;
            return locations.data;
        }else{
            [];
        }
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
export async function getTax() {
    try {
         const param = {
            table: 'tax',
            page: 1,
            // limit: 50,
            request_column:[],
            request_column_relation: []
        }

        const response = await axiosInstance.post('/search', param);
        if(response.status == 200){
            const items: Tax[] = response.data.data;
            return items;
        }else{
            [];
        }
    } catch (error: any) {
        message.error(`${error.response?.data?.message ?? error}`);
        return [];
    }
}