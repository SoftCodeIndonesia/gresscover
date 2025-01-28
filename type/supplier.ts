export type Supplier  = {
    supplier_id: string;      // ID Supplier, bisa berupa UUID
    name: string;             // Nama Supplier
    contact_name: string;     // Nama Kontak Supplier
    phone: string;            // Nomor Telepon Supplier
    email: string;            // Email Supplier
    address: string | null;   // Alamat Supplier, bisa null jika tidak ada
    created_at: string;       // Waktu pembuatan data
    updated_at: string;       // Waktu pembaruan data
}
  