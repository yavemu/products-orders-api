import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteUserResponseDto } from '../dto';

export function DeleteUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a user by ID',
      description: 'Deletes a user by its unique ID.',
    }),
    ApiParam({ name: 'id', type: String }),
    ApiResponse({
      status: 200,
      description: 'User deleted successfully',
      type: DeleteUserResponseDto,
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
