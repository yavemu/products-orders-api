import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UserResponseDto } from '../dto';

export function FindByIdUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get a user by ID',
      description: 'Returns a single user by its unique ID.',
    }),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
