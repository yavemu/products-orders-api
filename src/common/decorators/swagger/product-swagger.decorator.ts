import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function ApiCreateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new product' }),
    ApiResponse({
      status: 201,
      description: 'Product successfully created',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiBearerAuth('JWT-auth'),
  );
}

export function ApiGetProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a product by ID' }),
    ApiResponse({
      status: 200,
      description: 'Product found',
    }),
    ApiResponse({ status: 404, description: 'Product not found' }),
    ApiBearerAuth('JWT-auth'),
  );
}
