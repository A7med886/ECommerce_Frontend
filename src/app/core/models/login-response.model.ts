export interface LoginResponse {
  token: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}