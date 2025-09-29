export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "superadmin" | "admin" | "medic" | "nurse" | "laboratory" | "user";
  is_active: boolean;
}