import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindByIdUserDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por ID',
      description: 'Retorna un usuario específico por su ID único.',
    }),
    ApiParam({ name: 'id', type: String, description: 'ID único del usuario' }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Usuario encontrado exitosamente',
        type: UserResponseDto,
      },
      errors: [{ status: 404, description: 'Usuario no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
