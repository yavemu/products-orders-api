import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto, UserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function UpdateUserDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar datos de usuario',
      description: 'Actualiza únicamente el nombre y apellido del usuario.',
    }),
    ApiParam({ name: 'id', type: String, description: 'ID único del usuario' }),
    ApiBody({ type: UpdateUserDto }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Usuario actualizado exitosamente',
        type: UserResponseDto,
      },
      errors: [{ status: 404, description: 'Usuario no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
