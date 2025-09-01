import { Order } from '../schemas/order.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilter {
  clientName?: { $regex: string; $options: string };
  identifier?: { $regex: string; $options: string };
  status?: string;
  total?: { $gte?: number; $lte?: number };
  createdAt?: { $gte?: Date; $lte?: Date };
}

export interface OrderServiceResponse<T = Order> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OrderListResponse extends OrderServiceResponse<PaginatedResult<Order>> {}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface CreateOrderRequest {
  clientName: string;
  products: { productId: string; quantity: number }[];
}

export interface UpdateOrderRequest {
  clientName?: string;
  products?: { productId: string; quantity: number }[];
  status?: string;
}

export interface OrderStats {
  total: number;
  count: number;
  averageOrderValue: number;
}
