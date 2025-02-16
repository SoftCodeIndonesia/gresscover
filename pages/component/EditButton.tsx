import { Button, Popconfirm } from "antd";
import { DeleteFilled, EditFilled, PlusCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { MouseEventHandler, MouseEvent } from "react";

interface ButtonComponentProp {
    onClick?: MouseEventHandler<HTMLElement>,
    onComfirm?: (e?: MouseEvent<HTMLElement>) => void,
    label: string,
    titleConfirm?: string,
    okText?: string,
    cancelText?: string,
    disable?: boolean,
    href?: string,
}

const EditButton: React.FC<ButtonComponentProp> = ({onClick, label, disable, href}) => {
    return (
        <Button icon={<EditFilled/>} disabled={disable}  onClick={onClick} href={href} type="link" className='text-yellow-500' style={{ marginRight: 8 }}>
            {label}
        </Button>
    );
}

export default EditButton;