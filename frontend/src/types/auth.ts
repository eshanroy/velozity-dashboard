export type Role =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}