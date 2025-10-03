export interface UserAppointmentParams extends SearchParams {
  query?: string;
  start_date?: string;
  end_date?: string;
  include_recipes?: boolean;
  include_diagnoses?: boolean;
}

export interface AdvancedSearchParams extends SearchParams {
  query?: string;
  start_date?: string;
  end_date?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface SearchParams {
  skip?: number;
  limit?: number;
  include_patient?: boolean;
}

export interface DateRangeParams extends SearchParams {
  start_date: string;
  end_date: string;
}

export interface UpcomingAppointmentsParams extends SearchParams {
  days_ahead?: number;
}

export interface AppointmentSearchParams extends SearchParams {
  query: string;
}

export interface ApiErrorResponse {
  message?: string;
  detail?: string;
}

export interface DeleteResponse {
  message: string;
}

export interface AppointmentCountResponse {
  patient_id: number;
  appointment_count: number;
}
import type { Dayjs } from 'dayjs';
import type { JSX } from 'react';

export interface PatientOption {
  value: string;
  label: JSX.Element;
  patient: Patient;
}

export interface FormValues {
  searchPatient: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fecha: Dayjs;
  hora: Dayjs;
  antecedentes: string;
  enfermedadActual: string;
  temperatura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
  saturacionO2: string;
  peso: string;
  pesoUnidad: string;
  talla: string;
  medical_preinscription: string;
  examenFisico: string;
  observaciones: string;
  examenes: string;
}

export interface OriginalData {
  formData: Partial<FormValues>;
  recipes: Recipe[];
  patient: Patient;
  appointment: Appointment;
  diagnoses: Diagnosis[];
  assignedDoctor?: User;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}
// --- Extended/Local Types for Appointment Management ---

export interface Diagnosis {
  key: string;
  diagnosis_code: string;
  diagnosis_description: string;
  diagnosis_type: 'primary' | 'secondary';
  observations: string;
}

export interface AppointmentDiagnosis {
  id?: number;
  diagnosis_code: string;
  diagnosis_description: string;
  diagnosis_type: 'primary' | 'secondary';
}

export interface APIRecipe extends Recipe {
  key?: string;
  lunchTime?: string;
}

export type AppointmentUpdateData = {
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness: string;
  physical_examination: string;
  observations: string;
  laboratory_tests: string;
  temperature: string;
  blood_pressure: string;
  heart_rate: string;
  oxygen_saturation: string;
  weight: number;
  weight_unit: string;
  height: string;
  medical_preinscription: string;
  diagnoses: Array<{
    diagnosis_code: string;
    diagnosis_description: string;
    diagnosis_type: 'primary' | 'secondary';
  }>;
  recipes: Array<APIRecipe>;
};
import type { Recipe } from "./Recipe";
import type { UserData as User } from "./UserData";
import type { Patient } from "./Patient";

export interface Appointment {
  id?: number;
  patient_id: number;
  user_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness?: string;
  physical_examination?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  observations?: string;
  laboratory_tests?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: number;
  weight_unit?: string;
  height?: string;
  recipes?: Recipe[];
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  user?: User;
}

export interface AppointmentCreate {
  patient_id: number;
  user_id: number;
  appointment_date: string;
  appointment_time: string;
  current_illness?: string;
  physical_examination?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  observations?: string;
  laboratory_tests?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: number;
  weight_unit?: string;
  height?: string;
  recipes?: Recipe[];
}

export interface AppointmentUpdate {
  patient_id?: number;
  user_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  current_illness?: string;
  physical_examination?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  observations?: string;
  laboratory_tests?: string;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  oxygen_saturation?: string;
  weight?: number;
  weight_unit?: string;
  height?: string;
  recipes?: Recipe[];
}
