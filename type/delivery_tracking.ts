export type DeliveryTracking = {
  track_id: string;
  photo: string | null;
  reference: string;
  reference_id: string;
  description: string;
  date: string; // bisa di-parse ke Date kalau perlu
  created_at: string;
  updated_at: string;
  created_by: number;
  is_current: number; // 0 | 1
};