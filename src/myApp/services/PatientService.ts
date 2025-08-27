import axios, {  AxiosError, type AxiosResponse } from 'axios';


interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
  created_at?: string;
}

interface ContactCreate {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  relationship_type: string;
}

interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  birth_date?: string; // ISO date string
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

interface PatientCreate {
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

interface PatientUpdate {
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface SearchParams {
  skip?: number;
  limit?: number;
}

interface ApiErrorResponse {
  message?: string;
  detail?: string;
}

interface DeleteResponse {
  message: string;
}

const API_BASE_URL: string = 'http://localhost:8000';

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
  DeleteResponse
};