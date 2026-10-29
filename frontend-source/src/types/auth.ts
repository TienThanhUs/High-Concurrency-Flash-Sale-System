export type UserRole = 'USER' | 'ADMIN';

export interface JWTPayload {
  sub: string; // email
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface UserSession {
  userId: number;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
}
