export interface AppUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "superadmin";
}
