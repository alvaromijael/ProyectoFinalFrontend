import axios from 'axios';
import type { Contact } from '../interfaces/Contact';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contactService = {
  getContactsByPatientId: async (patientId: number): Promise<Contact[]> => {
    const response = await api.get<Contact[]>(`/contacts/patient/${patientId}`);
    return response.data;
  },
};