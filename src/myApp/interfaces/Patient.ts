export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface SearchParams {
  skip?: number;
  limit?: number;
}

export interface ApiErrorResponse {
  message?: string;
  detail?: string;
}

export interface DeleteResponse {
  message: string;
}
export type { ContactCreate } from './Contact';
import type { Dayjs } from 'dayjs';

export interface ContactForm {
  id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
}

export interface ContactFormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  relationship_type: string;
}

// Formulario de datos de paciente (para edición/creación)
export interface FormData {
  last_name: string;
  first_name: string;
  birth_date: Dayjs | null;
  age: string;
  gender: string;
  document_id: string;
  marital_status: string;
  occupation: string;
  education: string;
  origin: string;
  province: string;
  city: string;
  medical_history?: string;
  notes?: string;
  neighborhood: string;
  street: string;
  house_number: string;
  contacts: ContactForm[];
}

export interface DataEcuador {
  [provincia: string]: string[];
}

export interface PatientManage {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  document_id: string;
  medical_history: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  notes?: string;
  contacts: ContactCreate[];
}
import type { Contact, ContactCreate } from "./Contact";

export interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  birth_date?: string; 
  age?: string;
  gender?: string;
  document_id?: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  medical_history?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  contacts?: Contact[];
}

export interface PatientCreate {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  age?: string;
  gender?: string;
  document_id?: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  medical_history?: string;
  notes?: string;
  contacts?: ContactCreate[];
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  age?: string;
  gender?: string;
  document_id?: string;
  marital_status?: string;
  occupation?: string;
  education?: string;
  origin?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  medical_history?: string;
  notes?: string;
  contacts?: ContactCreate[];
}
