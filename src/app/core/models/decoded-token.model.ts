export interface DecodedToken {
  sub: string;  // userId
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  exp: number;
}