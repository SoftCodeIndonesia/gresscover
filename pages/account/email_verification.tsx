import { Button, Result } from "antd";
import Link from "next/link";

const EmailVerification: React.FC = () => {
    return (
        <Result
            status="success"
            title="Successfully Email Verification!"
            subTitle="Selamat Email Anda Telah Di Verifikasi, Silahkan Login!"
            extra={[
                <Button href={'/login'} type="primary" key="console">
                    Masuk
                </Button>,
            ]}
        />
    );
}

export default EmailVerification;