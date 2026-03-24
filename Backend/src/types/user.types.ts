export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithRole extends User {
  role_name: string;
  review_count?: number;
}