// Interfaces TypeScript
export interface TestCategory {
  title: string;
  color: string;
  tests: string[];
}

export interface PatientField {
  id: string;
  label: string;
  type: "text" | "select" | "number" | "date";
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

export interface LabFields {
  categories: Record<string, TestCategory>;
  patientFields: PatientField[];
}

export interface PatientData {
  [key: string]: string;
}

export interface SelectedTests {
  [key: string]: boolean;
}

export interface OrderData {
  selectedTests: string[];
  totalTests: number;
  createdAt: string;
  [key: string]: string | string[] | number; // Permite múltiples tipos
}