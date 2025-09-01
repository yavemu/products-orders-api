import { User } from '../../users/schemas/user.schema';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  user?: AuthUser;
  message?: string;
  error?: string;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

export interface ValidateUserResponse {
  success: boolean;
  user?: User;
  message?: string;
}
