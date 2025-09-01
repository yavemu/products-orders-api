import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SearchUserDto, UserResponseDto } from '../dto';

export function SearchUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Search users',
      description: 'Searches users by first name, last name, or email.',
    }),
    ApiBody({ type: SearchUserDto }),
    ApiResponse({
      status: 200,
      description: 'List of users matching the search criteria',
      type: [UserResponseDto],
    }),
    ApiResponse({ status: 400, description: 'Bad Request - Invalid search criteria' }),
  );
}
