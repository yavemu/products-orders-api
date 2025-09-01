import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function ApiCreateOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new order' }),
    ApiResponse({
      status: 201,
      description: 'Order successfully created',
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiBearerAuth('JWT-auth'),
  );
}

export function ApiGetOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an order by ID' }),
    ApiResponse({
      status: 200,
      description: 'Order found',
    }),
    ApiResponse({ status: 404, description: 'Order not found' }),
    ApiBearerAuth('JWT-auth'),
  );
}

export function ApiUpdateOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an order' }),
    ApiResponse({
      status: 200,
      description: 'Order successfully updated',
    }),
    ApiResponse({ status: 404, description: 'Order not found' }),
    ApiBearerAuth('JWT-auth'),
  );
}
