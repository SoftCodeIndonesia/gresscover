export type GroupSetting = {
    group_setting_id: string,
    name: string,
    description: string,
    settings: Setting[],
}
export type Setting = {
    group_setting_id: string,
    setting_id: string,
    name: string,
    slug: string,
    description: string,
    value: any,
}