export type Permission = {
    [key: string]: string;
  };
  
export type MenuItem = {
    key: string;
    name: string;
    route: string;
    icon: string | null;
    permissions: Permission | [];
    children: MenuItem[];
  };
  
export type MenuSide = MenuItem[];
  