import { Product } from '../schemas/product.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilter {
  name?: { $regex: string; $options: string };
  sku?: { $regex: string; $options: string };
  price?: { $gte?: number; $lte?: number };
  isActive?: boolean;
}

export interface ProductServiceResponse<T = Product> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProductListResponse extends ProductServiceResponse<PaginatedResult<Product>> {}

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  picture?: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  picture?: string;
}
