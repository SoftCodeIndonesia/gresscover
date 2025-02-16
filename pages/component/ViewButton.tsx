import { Button } from "antd";
import { EyeFilled} from '@ant-design/icons';
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

const ViewButton: React.FC<ButtonComponentProp> = ({onClick, label, disable, href}) => {
    return (
        <Button icon={<EyeFilled/>} disabled={disable}  onClick={onClick} href={href} type="link" style={{ marginRight: 8 }}>
            {label}
        </Button>
    );
}

export default ViewButton;