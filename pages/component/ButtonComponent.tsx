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
}

export const EditButton: React.FC<ButtonComponentProp> = ({onClick, label, disable}) => {
    return (
        <Button icon={<EditFilled/>} disabled={disable}  onClick={onClick} type="link" className='text-yellow-500' style={{ marginRight: 8 }}>
            {label}
        </Button>
    );
}

export const DeleteButton: React.FC<ButtonComponentProp> = ({onComfirm, label, titleConfirm, okText, cancelText, disable}) => {
    return (
        <Popconfirm
            title={titleConfirm ?? "Are you sure to delete this data?"}
            onConfirm={onComfirm}
            okText={okText ?? "Yes"}
            cancelText={cancelText ?? "No"}
          >
            <Button type="link" disabled={disable}  icon={<DeleteFilled/>} className='text-red-500'>{label}</Button>
        </Popconfirm>
    );
}