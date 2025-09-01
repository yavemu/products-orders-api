export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface HttpResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface HttpListResponse<T> extends HttpResponse<PaginatedData<T>> {}

export interface HttpSingleResponse<T> extends HttpResponse<T> {}
