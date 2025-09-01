import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from '../dto';

export function CreateUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new user',
      description: 'Registers a new user with first name, last name, email and password.',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input data or validation errors',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' }),
  );
}
