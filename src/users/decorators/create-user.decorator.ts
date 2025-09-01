import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function CreateUserDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new user',
      description: 'Registers a new user with first name, last name, email and password.',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiStandardResponses({
      success: {
        status: 201,
        description: 'Usuario creado exitosamente',
        type: UserResponseDto,
      },
      errors: [{ status: 409, description: 'Usuario ya existe con este email' }],
    }),
    ApiCommonErrorResponses(),
  );
}
