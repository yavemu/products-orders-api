import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto';

export function FindAllUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all users',
      description: 'Returns a list of all users in the system.',
    }),
    ApiResponse({
      status: 200,
      description: 'List of users retrieved successfully',
      type: [UserResponseDto],
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' }),
  );
}
