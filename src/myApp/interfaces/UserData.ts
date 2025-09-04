export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  is_active: boolean;
}