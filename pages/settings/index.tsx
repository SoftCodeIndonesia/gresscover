import { Breadcrumb, Button, Card, Checkbox, Collapse, CollapseProps, Form,  Input, message,  Radio, Space, } from "antd";
import DashboardLayout from "../component/DashboardLayout";
import Title from "antd/es/typography/Title";
import {useEffect, useState } from "react";
import { GroupSetting, Setting } from "@/type/setting";
import { Tax } from "@/type/tax";
import { getLocation, getPlatforms, getUnitType } from "@/utils/get_filters";
import { Location } from "@/type/location";
import { Platform } from "@/type/platform";
import { formatRupiah } from "@/utils/format_rupiah";

import React from "react";
import TableUnit from "../component/TableUnit";
import { ItemUnit } from "@/type/item";
import { ItemType } from "antd/es/menu/interface";
import axiosInstance from "@/utils/axiosInstance";
import { unknown } from "zod";


  

const Settings: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [group_setting, setGroupSetting] = useState<GroupSetting[]>([]);
    const [locations, setLocation] = useState<Location[]>([]);
    const [units, setUnits] = useState<ItemUnit[]>([]);
    const [platforms, setPlatform] = useState<Platform[]>([]);
    const [taxes, setInitialTableTax] = useState<Tax[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const [form] = Form.useForm();

    

    const fetch = async () => {
        setLoading(true);
        const settings = localStorage.getItem('settings');
        const settingsData: GroupSetting[] = JSON.parse(settings as string);
        settingsData.map((element) => {
            const settingGroupsValue: Setting[] = element.settings.map((setting) => checkValueSetting(setting));

            element.settings = settingGroupsValue;
        });


        setGroupSetting(settingsData);
        setInitialTaxes();
        const location = await fetchLocation();
        const platform = await fetchPlatform();
        const units = await fetchUnit();

        setLocation(location as unknown as Location[]);
        setPlatform(platform as unknown as Platform[]);
        setUnits(units as unknown as ItemUnit[]);

        initalForm(settingsData, units as unknown as ItemUnit[]);
        setLoading(false);
    }


    const checkValueSetting = (setting: Setting) => {
        if(setting.value != null){
            const decodeValue = JSON.parse(setting.value as string)
            if(setting.slug == 'default-pilihan-untuk-platform-penjualan'){
                const platformPenjualan: Platform = decodeValue as Platform;
                setting.value = platformPenjualan.id;
            }else if(setting.slug == 'default-pilihan-untuk-potongan-penjualan'){
                const taxesData: Tax[] = decodeValue as Tax[];
                setting.value = taxesData.map((value) => value.tax_id);
            }else if(setting.slug == 'default-pilihan-gudang-untuk-penjualan'){
                const locationDefault: Location = decodeValue as Location;
                setting.value = locationDefault.location_id;
            }
        }
        
        
        return setting;
    }


    const setInitialTaxes = () => {
        const tax = localStorage.getItem('taxs');
        const taxData: Tax[] = JSON.parse(tax as string);
        setInitialTableTax(taxData);
    }

    const fetchLocation = async () => {
        const response = await getLocation();
        return response;
    }

    const fetchUnit = async () => {
        const response = await getUnitType();
        return response;
    }

    const fetchPlatform = async () => {
        const response = await getPlatforms();
        return response;
    }

    const getExtra = (setting: Setting) => {
        if(setting.slug == 'default-pilihan-untuk-platform-penjualan'){
            return <p>{selectedPlatform} </p>;
        }else{
            return <p></p>;
        }
    }

    const getContentCollabse = (setting: Setting, index: number) => {
        if(setting.slug == 'default-pilihan-untuk-platform-penjualan'){
            return platformTable(setting);
        }else if(setting.slug == 'default-pilihan-untuk-potongan-penjualan'){
            return taxesContentView(setting);
        }else if(setting.slug == 'default-pilihan-gudang-untuk-penjualan'){
            return defaultLocations(setting);
        }else if(setting.slug == 'pengaturan-konversi-satuan'){
            
            return <TableUnit key={index} units={units} onSave={onHandleEditUnits}/>
        }else if(setting.slug == 'informasi-toko'){
            
            return storeInformation(setting);
        }else{
            return <p></p>;
        }
    }

    const generateCollapsable = (settings: Setting[]) => {
        const contents = settings.map((value, index) => (
            {
                key: `${index}`,
                label: `${value.name}`,
                children: getContentCollabse(value, index),
                // extra: getExtra(value)
            }
        ))

        return contents;
    }

    const onHandleEditUnits = (units: ItemUnit[]) => {
        setUnits(units);
    }

    const onChange = (key: string | string[]) => {
        console.log(key);
    };

    const platformTable = (setting: Setting) => {
       
        return (
            <>
            <Form.Item name={['setting', getIndexForm(setting), 'setting_id']} label="Platform" rules={[{ required: true, message: 'Pilih Salah Satu Platform Penjualan' }]}>
                    <Input value={setting.setting_id} />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value']} label="Platform" rules={[{ required: true, message: 'Pilih Salah Satu Platform Penjualan' }]}>
                    <Radio.Group>
                        {platforms.map((value) => (<Radio key={value.id} value={value.id}> {value.name} </Radio>))}
                    </Radio.Group>
            </Form.Item>
            </>
            
            
        );
    }

    const taxesContentView = (setting: Setting) => {
       
        return (
            <>
            
            <Form.Item hidden name={['setting', getIndexForm(setting), 'setting_id']} label="Platform" rules={[{ required: true, message: 'Pilih Salah Satu Platform Penjualan' }]}>
                    <Input value={setting.setting_id} />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value']} label="Potongan">
                <Checkbox.Group>
                {taxes.map((value) => (<Checkbox key={value.tax_id} value={value.tax_id}>{value.name} ({value.unit_value == 'percent' ? `${value.value}%` : formatRupiah(value.value ?? 0)})</Checkbox>))}
                </Checkbox.Group>
            </Form.Item>

            </>
            
            
        );
    }
    const storeInformation = (setting: Setting) => {
       
        return (
            <>
            
            <Form.Item hidden name={['setting', getIndexForm(setting), 'setting_id']} label="Informasi Toko" rules={[{ required: true, message: 'Masukan id pengaturan' }]}>
                    <Input value={setting.setting_id} />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value', 'name']} label="Nama Toko" rules={[{ required: true, message: 'Masukan Nama Toko' }]}>
                <Input />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value', 'phone']} label="Nomor Telepon" rules={[{ required: true, message: 'Masukan Nomor Telepon' }]}>
                <Input />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value', 'address']} label="Alamat Toko" rules={[{ required: true, message: 'Masukan Alamat Toko' }]}>
                <Input.TextArea rows={3} />
            </Form.Item>

            </>
            
            
        );
    }
    const defaultLocations = (setting: Setting) => {
       
        return (
            <>
            <Form.Item hidden name={['setting', getIndexForm(setting), 'setting_id']} label="Platform" rules={[{ required: true, message: 'Pilih Salah Satu Platform Penjualan' }]}>
                    <Input value={setting.setting_id} />
            </Form.Item>
            <Form.Item name={['setting', getIndexForm(setting), 'value']} label="Gudang Default" rules={[{ required: true, message: 'Pilih Default Gudang Untuk Penjualan' }]}>
                <Radio.Group>
                        {locations.map((value) => (<Radio key={value.location_id} value={value.location_id}> {value.name} </Radio>))}
                    </Radio.Group>
            </Form.Item>
            </>
            
            
        );
    }

    const initalForm = (settings: GroupSetting[], units: ItemUnit[]) => {
        const settingForm: {setting_id: string, value: any|any[]|null}[] = [];
        settings.forEach(element => {
            element.settings.forEach(elementSetting => {
                if(elementSetting.slug == 'informasi-toko'){
settingForm.push({
                    setting_id: elementSetting.setting_id,
                    value: JSON.parse(elementSetting.value),
                });
                }else{
                    settingForm.push({
                    setting_id: elementSetting.setting_id,
                    value: elementSetting.value,
                });
                }
            });
        });
        console.log(settingForm);
        form.setFieldsValue({'setting': settingForm});
    }

    const getIndexForm = (setting: Setting) => {
        console.log(form.getFieldValue('setting'))
        const data: {setting_id: string, value: any|null}[] = form.getFieldValue('setting');
        return data.findIndex((value) => value.setting_id == setting.setting_id);
    }

    const handleSubmit = async (values: any) => {
        const data = {
            units: units,
            ...values,
        }

        setLoading(true);
        try {
            
            const response = await axiosInstance.post('/setting', data);

            if(response.status == 200){
                const setting = response.data.data;
                localStorage.setItem("settings", JSON.stringify(setting));
                fetch();
                message.success('Berhasil!!');
            }else{
                message.error(`${response?.data?.message}`);
            }
            
        } catch (error: any) {
            message.error(`${error.response?.data?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetch();
        
    }, []);

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
                        title: 'Pengaturan',  
                    },
                ]}
            />
            <Title level={2}>Pengaturan</Title>
           {!loading &&  <Form form={form} onFinish={handleSubmit}>
            { group_setting.map((data) => (
                <Card title={data.name} key={data.group_setting_id} className="mb-4">
                    <Collapse items={generateCollapsable(data.settings)} defaultActiveKey={data.settings.map((value, index) => index)} onChange={onChange} />
                </Card>
            )) }

                <Form.Item>
                    <Button type="link" href="/" loading={loading} >Batal</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Kirim</Button>
                </Form.Item>

            </Form>}
        </DashboardLayout>
    );
}
export default Settings;