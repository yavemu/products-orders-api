import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { HttpResponse, PaginatedData } from '../interfaces/http-response.interface';

@Injectable()
export class HttpResponseInterceptor<T> implements NestInterceptor<T, HttpResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<HttpResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map(data => {
        // Handle different response types
        if (this.isCsvResponse(data)) {
          // CSV responses should be returned as-is (handled by CsvResponseInterceptor)
          return data;
        }

        if (this.isAuthResponse(data)) {
          // Auth responses should be returned as-is (login/register)
          const statusCode = this.getSuccessStatusCode(method);
          response.status(statusCode);
          return data;
        }

        if (this.isServiceResponse(data)) {
          // Service already returned structured response (legacy support)
          return this.formatServiceResponse(data, response, method);
        }

        // Handle raw data responses
        return this.formatRawResponse(data, response, method);
      }),
    );
  }

  private isServiceResponse(data: any): boolean {
    return data && typeof data === 'object' && 'success' in data;
  }

  private isCsvResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'csvContent' in data &&
      'headers' in data &&
      typeof data.csvContent === 'string' &&
      typeof data.headers === 'object'
    );
  }

  private isAuthResponse(data: any): boolean {
    return data && typeof data === 'object' && 'access_token' in data;
  }

  private formatServiceResponse(data: any, response: Response, method: string): HttpResponse<T> {
    const statusCode = this.getSuccessStatusCode(method);
    response.status(statusCode);

    return {
      success: true,
      data: data.data,
      message: data.message,
      statusCode,
    };
  }

  private formatRawResponse(data: any, response: Response, method: string): HttpResponse<T> {
    const statusCode = this.getSuccessStatusCode(method);
    response.status(statusCode);

    // Handle paginated responses
    if (this.isPaginatedData(data)) {
      return {
        success: true,
        data: data,
        statusCode,
      };
    }

    // Handle array responses (convert to paginated)
    if (Array.isArray(data)) {
      const paginatedData: PaginatedData<any> = {
        data: data,
        meta: {
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        },
      };

      return {
        success: true,
        data: paginatedData as T,
        statusCode,
      };
    }

    // Handle single item responses
    return {
      success: true,
      data: data,
      statusCode,
    };
  }

  private isPaginatedData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      Array.isArray(data.data) &&
      typeof data.meta === 'object' &&
      'page' in data.meta &&
      'limit' in data.meta &&
      'total' in data.meta &&
      'totalPages' in data.meta
    );
  }

  private getSuccessStatusCode(method: string): number {
    switch (method) {
      case 'POST':
        return HttpStatus.CREATED;
      case 'DELETE':
        return HttpStatus.OK;
      case 'GET':
      case 'PUT':
      case 'PATCH':
      default:
        return HttpStatus.OK;
    }
  }
}
