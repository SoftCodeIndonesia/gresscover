import { Button, Popconfirm } from "antd";
import { useState } from "react";

type Props = {
    title: string,
    description: string,
    loading: boolean,
    disabled: boolean,
    label: string,
    onConfirm: () => void,
    onCancel: () => void,
};

const CustomButtonPopConfirm: React.FC<Props> = ({disabled, label, title, description, loading, onCancel, onConfirm}) => {
    const [state, setState] = useState<boolean>(false);



    return (
        <Popconfirm
            title={title}
            description={description}
            open={state}
            onConfirm={()=> {
                setState(false);
                return onConfirm()
            }}
            okButtonProps={{ loading: loading }}
            onCancel={() => {
                setState(false);
                return onCancel;
            }}
            >
            <Button disabled={disabled} type="text" onClick={() => {
                                setState(true);
                            }} >{label}</Button>
        </Popconfirm>
    )
}

export default CustomButtonPopConfirm;