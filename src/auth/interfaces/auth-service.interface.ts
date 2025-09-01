import { User } from '../../users/schemas/user.schema';
import { UserRole } from '../../users/enums';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
