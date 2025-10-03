export interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
  created_at?: string;
}

export interface ContactCreate {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
}
