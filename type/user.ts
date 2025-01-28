import { Permission } from "./permission";

export type User = {
    id: number;
    unique_id: string;
    photo: string | null;
    telephone: string | null;
    name: string;
    email: string;
    email_verified_at: string | null;
    fcm_token: string | null;
    created_at: string;
    updated_at: string;
    permissions: Permission[],
}