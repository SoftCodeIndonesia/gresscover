export interface Location {
    location_id: string; // UUID
    parent_id: string | null;
    name: string;
    slug: string;
    created_by: number;
    created_at: string; // ISO 8601 Timestamp
    updated_at: string; // ISO 8601 Timestamp
    parent: Location | null,
  }

export interface LocationInput {
  parent_id?: string | null;
  location_id?: string | null;
  name: string;
}