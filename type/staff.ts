import { User } from "./user";

export interface Staff {
    staff_id: string;
    user_id: number;
    hire_date: string;
    created_at: string;
    updated_at: string;
    user: User; // Relasi ke User
    creator: User; // Relasi ke User
}

// Tipe data untuk daftar staff
export type StaffList = Staff[];