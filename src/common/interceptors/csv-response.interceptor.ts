import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface CsvResponse {
  csvContent: string;
  headers: Record<string, string>;
}

@Injectable()
export class CsvResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Check if this is a CSV response
        if (this.isCsvResponse(data)) {
          const response = context.switchToHttp().getResponse<Response>();
          const csvResponse = data as CsvResponse;

          // Set CSV headers
          Object.entries(csvResponse.headers).forEach(([key, value]) => {
            response.setHeader(key, value);
          });

          // Return just the content for Express to send
          return csvResponse.csvContent;
        }

        // Return normal JSON response
        return data;
      }),
    );
  }

  private isCsvResponse(data: any): data is CsvResponse {
    return (
      data &&
      typeof data === 'object' &&
      'csvContent' in data &&
      'headers' in data &&
      typeof data.csvContent === 'string' &&
      typeof data.headers === 'object'
    );
  }
}
