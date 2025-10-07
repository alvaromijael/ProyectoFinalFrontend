
import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { Appointment, AppointmentCreate, AppointmentUpdate } from '../interfaces/Appointment';
import type { Recipe } from '../interfaces/Recipe';
import type { UserData as User } from '../interfaces/UserData';
import type { Patient } from '../interfaces/Patient';

import type {
  UserAppointmentParams,
  AdvancedSearchParams,
  ApiResponse,
  SearchParams,
  DateRangeParams,
  UpcomingAppointmentsParams,
  AppointmentSearchParams,
  ApiErrorResponse,
  DeleteResponse,
  AppointmentCountResponse
} from '../interfaces/Appointment';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

class AppointmentService {
  
  static async createAppointment(appointmentData: AppointmentCreate): Promise<ApiResponse<Appointment>> {
    try {
      console.log("appointmen", appointmentData)
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

  static async getAppointmentsByUser(
    userId: number,
    params: UserAppointmentParams = {}
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      const { 
        skip = 0, 
        limit = 100, 
        include_patient = true,
        include_recipes = true,
        include_diagnoses = true,
        query,
        start_date,
        end_date
      } = params;

      const searchParams = new URLSearchParams();
      searchParams.append('skip', skip.toString());
      searchParams.append('limit', limit.toString());
      searchParams.append('include_patient', include_patient.toString());
      searchParams.append('include_recipes', include_recipes.toString());
      searchParams.append('include_diagnoses', include_diagnoses.toString());

      if (query && query.trim()) {
        searchParams.append('query', query.trim());
      }
      if (start_date) {
        searchParams.append('start_date', start_date);
      }
      if (end_date) {
        searchParams.append('end_date', end_date);
      }

      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/user/${userId}?${searchParams.toString()}`
      );

      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas para el médico`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error al obtener las citas del médico');
    }
  }

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

  static async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response: AxiosResponse<{message: string, data: User[]}> = await api.get<{message: string, data: User[]}>('/users?role=medic');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError<User[]>(error, 'Error al obtener los usuarios');
    }
  }

  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  static formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
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

  static formatWeight(weight?: number, unit?: string): string {
    if (!weight) return '';
    
    const unitSymbol = unit || 'kg';
    return `${weight} ${unitSymbol}`;
  }

  static convertWeight(weight: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return weight;
    
    let weightInKg: number;
    switch (fromUnit.toLowerCase()) {
      case 'g':
        weightInKg = weight / 1000;
        break;
      case 'lb':
        weightInKg = weight * 0.453592;
        break;
      case 'kg':
      default:
        weightInKg = weight;
        break;
    }
    
    switch (toUnit.toLowerCase()) {
      case 'g':
        return weightInKg * 1000;
      case 'lb':
        return weightInKg / 0.453592;
      case 'kg':
      default:
        return weightInKg;
    }
  }

  static validateWeight(weight: number, unit: string): { isValid: boolean; message?: string } {
    if (weight <= 0) {
      return { isValid: false, message: 'El peso debe ser mayor a 0' };
    }

    switch (unit.toLowerCase()) {
      case 'kg':
        if (weight > 500) {
          return { isValid: false, message: 'Peso en kg no puede exceder 500 kg' };
        }
        if (weight < 0.1) {
          return { isValid: false, message: 'Peso en kg no puede ser menor a 0.1 kg' };
        }
        break;
      case 'lb':
        if (weight > 1100) {
          return { isValid: false, message: 'Peso en lb no puede exceder 1100 lb' };
        }
        if (weight < 0.22) {
          return { isValid: false, message: 'Peso en lb no puede ser menor a 0.22 lb' };
        }
        break;
      case 'g':
        if (weight > 500000) {
          return { isValid: false, message: 'Peso en g no puede exceder 500,000 g' };
        }
        if (weight < 100) {
          return { isValid: false, message: 'Peso en g no puede ser menor a 100 g' };
        }
        break;
      default:
        return { isValid: false, message: 'Unidad de peso no válida' };
    }

    return { isValid: true };
  }

  static getWeightUnitOptions(): Array<{ value: string; label: string; suffix: string }> {
    return [
      { value: 'kg', label: 'Kilogramos (kg)', suffix: 'kg' },
      { value: 'lb', label: 'Libras (lb)', suffix: 'lb' },
      { value: 'g', label: 'Gramos (g)', suffix: 'g' }
    ];
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

    console.error('AppointmentService Error:', error);

    return {
      success: false,
      data: null as T,
      message: errorMessage
    };
  }

  static async searchAppointmentsAdvanced(params: AdvancedSearchParams): Promise<ApiResponse<Appointment[]>> {
    try {
      const { query, start_date, end_date, skip = 0, limit = 100 }: AdvancedSearchParams = params;
      
      const searchParams = new URLSearchParams();
      searchParams.append('skip', skip.toString());
      searchParams.append('limit', limit.toString());
      
      if (query && query.trim()) {
        searchParams.append('query', query.trim());
      }
      if (start_date) {
        searchParams.append('start_date', start_date);
      }
      if (end_date) {
        searchParams.append('end_date', end_date);
      }
      
      const response: AxiosResponse<Appointment[]> = await api.get<Appointment[]>(
        `/appointments/search?${searchParams.toString()}`
      );
      
      return {
        success: true,
        data: response.data,
        message: `${response.data.length} citas encontradas con los criterios especificados`
      };
    } catch (error) {
      return this.handleError<Appointment[]>(error, 'Error en la búsqueda avanzada de citas');
    }
  }
}

export default AppointmentService;
export type { 
  Appointment, 
  AppointmentCreate, 
  AppointmentUpdate,
  Patient,
  Recipe,
  User,
  ApiResponse, 
  SearchParams,
  DateRangeParams,
  UpcomingAppointmentsParams,
  AppointmentSearchParams,
  ApiErrorResponse,
  DeleteResponse,
  AppointmentCountResponse,
  UserAppointmentParams
};