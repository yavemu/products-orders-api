import { PaginatedData, PaginationMeta } from '../interfaces/http-response.interface';

export class ServiceUtil {
  static createSuccessResponse<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message,
    };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedData<T> {
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return {
      data,
      meta,
    };
  }

  static processPaginatedResult<T, R>(result: any, mapFunction: (item: T) => R): PaginatedData<R> {
    if (result && typeof result === 'object' && 'data' in result) {
      const mappedData = result.data.map(mapFunction);
      return this.createPaginatedResponse(mappedData, result.total, result.page, result.limit);
    }
    return this.createListResponse([]);
  }

  static createListResponse<T>(data: T[]): PaginatedData<T> {
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

  static buildSearchFilter(searchParams: Record<string, any>): Record<string, any> {
    const filter: Record<string, any> = {};

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && !key.includes('Id')) {
          // Text search with regex
          filter[key] = { $regex: value, $options: 'i' };
        } else if (key.includes('min') || key.includes('max')) {
          // Range queries
          const fieldName = key.replace(/^(min|max)/, '').toLowerCase();
          if (!filter[fieldName]) {
            filter[fieldName] = {};
          }
          if (key.startsWith('min')) {
            filter[fieldName].$gte = value;
          } else if (key.startsWith('max')) {
            filter[fieldName].$lte = value;
          }
        } else {
          // Exact match
          filter[key] = value;
        }
      }
    });

    return filter;
  }
}
