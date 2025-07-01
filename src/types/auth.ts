export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'client' | 'barber' | 'admin';
    fullName: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'client' | 'barber' | 'admin';
    fullName: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string | null;
  role?: 'client' | 'barber';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'client' | 'barber' | 'admin';
  iat?: number;
  exp?: number;
}