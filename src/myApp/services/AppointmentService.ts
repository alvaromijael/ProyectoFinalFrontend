import axios, {  AxiosError, type AxiosResponse } from 'axios';


interface Patient {
  id?: number;
  first_name?: string;
  last_name?: string;
  document_id?: string;
}

interface Appointment {
  id?: number;
  patient_id: number;
  appointment_date: string; // ISO date string (YYYY-MM-DD)
  appointment_time: string; // Time string (HH:MM:SS)
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
  weight?: string;
  height?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
}

interface AppointmentCreate {
  patient_id: number;
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
  weight?: string;
  height?: string;
}

interface AppointmentUpdate {
  patient_id?: number;
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
  weight?: string;
  height?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface SearchParams {
  skip?: number;
  limit?: number;
  include_patient?: boolean;
}

interface DateRangeParams extends SearchParams {
  start_date: string;
  end_date: string;
}

interface UpcomingAppointmentsParams extends SearchParams {
  days_ahead?: number;
}

interface AppointmentSearchParams extends SearchParams {
  query: string;
}

interface ApiErrorResponse {
  message?: string;
  detail?: string;
}

interface DeleteResponse {
  message: string;
}

interface AppointmentCountResponse {
  patient_id: number;
  appointment_count: number;
}

const API_BASE_URL: string = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AppointmentService {
  
  // Crear nueva cita
  static async createAppointment(appointmentData: AppointmentCreate): Promise<ApiResponse<Appointment>> {
    try {
      const response: AxiosResponse<Appointment> = await api.post<Appointment>('/appointments', appointmentData);
      return {
        success: true,
        data: response.data,
        message: 'Cita creada exitosamente'
      };
    } catch (error) {
      return this.handleError<Appointment>(error, 'Error al crear la cita');
    }
  }

  // Obtener todas las citas
  static async getAppointments(params: SearchParams = {}): Promise<ApiResponse<Appointment[]>> {
    try {
      const { skip = 0, limit = 100, include_patient = true }: SearchParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments?skip=${skip}&limit=${limit}&include_patient=${include_patient}`
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Citas obtenidas exitosamente'
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener las citas');
    }
  }

  // Obtener cita por ID
  static async getAppointmentById(appointmentId: string | number): Promise<ApiResponse<Appointment>> {
    try {
      const response: AxiosResponse<Appointment> = await api.get<Appointment>(`/appointments/${appointmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Cita obtenida exitosamente'
      };
    } catch (error) {
      return this.handleError<Appointment>(error, 'Error al obtener la cita');
    }
  }

  // Obtener citas de hoy
  static async getTodayAppointments(): Promise<ApiResponse<Appointment[]>> {
    try {
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>('/appointments/today');
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas para hoy`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener las citas de hoy');
    }
  }

  // Obtener próximas citas
  static async getUpcomingAppointments(params: UpcomingAppointmentsParams = {}): Promise<ApiResponse<Appointment[]>> {
    try {
      const { skip = 0, limit = 100, days_ahead = 7 }: UpcomingAppointmentsParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/upcoming?days_ahead=${days_ahead}&skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} próximas citas encontradas`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener las próximas citas');
    }
  }

  // Buscar citas
  static async searchAppointments(params: AppointmentSearchParams): Promise<ApiResponse<Appointment[]>> {
    try {
      const { query, skip = 0, limit = 100 }: AppointmentSearchParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al buscar citas');
    }
  }

  // Obtener citas por rango de fechas
  static async getAppointmentsByDateRange(params: DateRangeParams): Promise<ApiResponse<Appointment[]>> {
    try {
      const { start_date, end_date, skip = 0, limit = 100 }: DateRangeParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/by-date-range?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas en el rango de fechas`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener citas por rango de fechas');
    }
  }

  // Obtener citas por estado
  static async getAppointmentsByStatus(status: string, params: SearchParams = {}): Promise<ApiResponse<Appointment[]>> {
    try {
      const { skip = 0, limit = 100 }: SearchParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/by-status/${status}?skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas con estado '${status}' encontradas`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener citas por estado');
    }
  }

  // Obtener citas de un paciente
  static async getAppointmentsByPatient(patientId: string | number, params: SearchParams = {}): Promise<ApiResponse<Appointment[]>> {
    try {
      const { skip = 0, limit = 100 }: SearchParams = params;
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/patient/${patientId}?skip=${skip}&limit=${limit}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas para el paciente`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener las citas del paciente');
    }
  }

  // Contar citas de un paciente
  static async getAppointmentCountByPatient(patientId: string | number): Promise<ApiResponse<AppointmentCountResponse>> {
    try {
      const response: AxiosResponse<AppointmentCountResponse> = await api.get<AppointmentCountResponse>(
        `/appointments/patient/${patientId}/count`
      );
      
      return {
        success: true,
        data: response.data,
        message: `Paciente tiene ${response.data.appointment_count} citas`
      };
    } catch (error) {
      return this.handleError<AppointmentCountResponse>(error, 'Error al contar las citas del paciente');
    }
  }

  // Actualizar cita
  static async updateAppointment(appointmentId: string | number, appointmentData: AppointmentUpdate): Promise<ApiResponse<Appointment>> {
    try {
      const response: AxiosResponse<Appointment> = await api.put<Appointment>(`/appointments/${appointmentId}`, appointmentData);
      return {
        success: true,
        data: response.data,
        message: 'Cita actualizada exitosamente'
      };
    } catch (error) {
      return this.handleError<Appointment>(error, 'Error al actualizar la cita');
    }
  }

  // Eliminar cita
  static async deleteAppointment(appointmentId: string | number): Promise<ApiResponse<DeleteResponse>> {
    try {
      const response: AxiosResponse<DeleteResponse> = await api.delete<DeleteResponse>(`/appointments/${appointmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Cita eliminada exitosamente'
      };
    } catch (error) {
      return this.handleError<DeleteResponse>(error, 'Error al eliminar la cita');
    }
  }

  // Métodos utilitarios
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  static formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0]; // HH:MM:SS
  }

  static parseAppointmentDateTime(appointment: Appointment): Date | null {
    if (!appointment.appointment_date || !appointment.appointment_time) return null;
    
    const dateTimeString: string = `${appointment.appointment_date}T${appointment.appointment_time}`;
    return new Date(dateTimeString);
  }

  static isAppointmentToday(appointment: Appointment): boolean {
    const today: string = new Date().toISOString().split('T')[0];
    return appointment.appointment_date === today;
  }

  static isAppointmentUpcoming(appointment: Appointment): boolean {
    if (!appointment.appointment_date || !appointment.appointment_time) return false;
    
    const appointmentDateTime: Date | null = this.parseAppointmentDateTime(appointment);
    if (!appointmentDateTime) return false;
    
    return appointmentDateTime > new Date();
  }

  // Manejo de errores
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

    console.error('AppointmentService Error:', error);

    return {
      success: false,
      data: null as T,
      message: errorMessage
    };
  }
}

export default AppointmentService;
export type { 
  Appointment, 
  AppointmentCreate, 
  AppointmentUpdate,
  Patient,
  ApiResponse, 
  SearchParams,
  DateRangeParams,
  UpcomingAppointmentsParams,
  AppointmentSearchParams,
  ApiErrorResponse,
  DeleteResponse,
  AppointmentCountResponse
};