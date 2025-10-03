export interface Recipe {
  medicine: string;
  amount: string;
  instructions: string;
  observations: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  role: string;
  created_at: string;
  is_active: boolean;
}
