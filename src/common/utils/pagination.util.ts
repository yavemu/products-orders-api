import { PaginatedData, PaginationMeta } from '../interfaces/http-response.interface';

export class PaginationUtil {
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedData<T> {
    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
    };

    return {
      data,
      meta,
    };
  }

  static createSimpleListResponse<T>(data: T[]): PaginatedData<T> {
    const meta: PaginationMeta = {
      page: 1,
      limit: data.length,
      total: data.length,
      totalPages: 1,
    };

    return {
      data,
      meta,
    };
  }
}
