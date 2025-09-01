import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto, UserResponseDto } from '../dto';

export function UpdateUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update user details',
      description: 'Updates only the first name and last name of the user.',
    }),
    ApiParam({ name: 'id', type: String }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto }),
    ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
