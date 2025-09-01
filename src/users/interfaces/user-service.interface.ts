import { User } from '../schemas/user.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilter {
  firstName?: { $regex: string; $options: string };
  lastName?: { $regex: string; $options: string };
  email?: { $regex: string; $options: string };
}

export interface UserServiceResponse<T = User> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserListResponse extends UserServiceResponse<PaginatedResult<User>> {}
