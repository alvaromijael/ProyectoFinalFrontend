export interface AppUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
}

type RoleType = {
  name: string;
};


