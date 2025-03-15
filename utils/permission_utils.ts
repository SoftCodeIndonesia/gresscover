export function hasPermission(params:string) {
    const permissionsString = localStorage.getItem('permissions');
    const permissions: string[] = JSON.parse(permissionsString as string);

    const check = permissions.filter((value) => value == params);

    if(check.length > 0){
        return true;
    }else{
        return false;
    }
}