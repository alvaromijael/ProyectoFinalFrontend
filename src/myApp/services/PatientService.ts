
import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { Patient, PatientCreate, PatientUpdate } from '../interfaces/Patient';
import type { Contact, ContactCreate } from '../interfaces/Contact';


import type { ApiResponse, SearchParams, ApiErrorResponse, DeleteResponse } from '../interfaces/Patient';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class PatientService {
  
  static async createPatient(patientData: PatientCreate): Promise<ApiResponse<Patient>> {
    try {
      const response: AxiosResponse<Patient> = await api.post<Patient>('/patients', patientData);
      return {
        success: true,
        data: response.data,
        message: 'Paciente creado exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient>(error, 'Error al crear el paciente');
    }
  }

  static async getPatients(params: SearchParams = {}): Promise<ApiResponse<Patient[]>> {
    try {
      const { skip = 0, limit = 100 }: SearchParams = params;
      const response: AxiosResponse<Patient[]> = await api.get<Patient[]>(`/patients?skip=${skip}&limit=${limit}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Pacientes obtenidos exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient[]>(error, 'Error al obtener los pacientes');
    }
  }

  static async getPatientById(patientId: string | number): Promise<ApiResponse<Patient>> {
    try {
      const response: AxiosResponse<Patient> = await api.get<Patient>(`/patients/${patientId}`);
      return {
        success: true,
        data: response.data,
        message: 'Paciente obtenido exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient>(error, 'Error al obtener el paciente');
    }
  }

  static async getPatientByDocument(documentId: string): Promise<ApiResponse<Patient>> {
    try {
      const response: AxiosResponse<Patient> = await api.get<Patient>(`/patients/document/${documentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Paciente encontrado exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient>(error, 'Paciente no encontrado');
    }
  }

  static async updatePatient(patientId: string | number, patientData: PatientUpdate): Promise<ApiResponse<Patient>> {
    try {
      const response: AxiosResponse<Patient> = await api.put<Patient>(`/patients/${patientId}`, patientData);
      return {
        success: true,
        data: response.data,
        message: 'Paciente actualizado exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient>(error, 'Error al actualizar el paciente');
    }
  }

   static async managePatient(patientId: string | number, patientData: PatientUpdate): Promise<ApiResponse<Patient>> {
    try {
      const response: AxiosResponse<Patient> = await api.put<Patient>(`/patients/manage/${patientId}`, patientData);
      return {
        success: true,
        data: response.data,
        message: 'Paciente actualizado exitosamente'
      };
    } catch (error) {
      return this.handleError<Patient>(error, 'Error al actualizar el paciente');
    }
  }

  static async deletePatient(patientId: string | number): Promise<ApiResponse<DeleteResponse>> {
    try {
      const response: AxiosResponse<DeleteResponse> = await api.delete<DeleteResponse>(`/patients/${patientId}`);
      return {
        success: true,
        data: response.data,
        message: 'Paciente eliminado exitosamente'
      };
    } catch (error) {
      return this.handleError<DeleteResponse>(error, 'Error al eliminar el paciente');
    }
  }

  static async generateMedicalHistory(patientId: number): Promise<ApiResponse<{ 
  success: boolean;
  patient_id: number;
  filename: string;
  pdf_base64: string;
  size_bytes: number;
  generated_at: string;
}>> {
  try {
    const response: AxiosResponse<{
      success: boolean;
      patient_id: number;
      filename: string;
      pdf_base64: string;
      size_bytes: number;
      generated_at: string;
    }> = await api.get(`/reports/medical-history/${patientId}`);
    
    return {
      success: true,
      data: response.data,
      message: 'Historial médico generado exitosamente'
    };
  } catch (error) {
    return this.handleError(error, 'Error al generar el historial médico');
  }
}

  static async searchPatients(query: string, params: SearchParams = {}): Promise<ApiResponse<Patient[]>> {
    try {
      const { skip = 0, limit = 100 }: SearchParams = params;
      const response: AxiosResponse<Patient[]> = await api.get<Patient[]>(
        `/patients/search?query=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} pacientes encontrados`
      };
    } catch (error) {
      return this.handleError<Patient[]>(error, 'Error al buscar pacientes');
    }
  }

  private static handleError<T>(error: unknown, defaultMessage: string): ApiResponse<T> {
    let errorMessage: string = defaultMessage;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      errorMessage = axiosError.response?.data?.message || 
                    axiosError.response?.data?.detail || 
                    axiosError.message || 
                    defaultMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return {
      success: false,
      data: null as T,
      message: errorMessage
    };
  }

  
}

export default PatientService;
export type { 
  Patient, 
  PatientCreate, 
  PatientUpdate, 
  Contact, 
  ContactCreate, 
  ApiResponse, 
  SearchParams,
  ApiErrorResponse,
  DeleteResponse,
  
};