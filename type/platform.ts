import { User } from "./user"

export type Platform = {
    id: number,
    name: string,
    slug: string,
    created_at: string,
    updated_at: string,
    created_by: number,
    user: User|null,
}