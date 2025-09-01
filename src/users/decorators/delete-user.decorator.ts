import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DeleteUserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function DeleteUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Eliminar usuario por ID',
      description: 'Elimina un usuario por su ID único.',
    }),
    ApiParam({ name: 'id', type: String, description: 'ID único del usuario' }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Usuario eliminado exitosamente',
        type: DeleteUserResponseDto,
      },
      errors: [{ status: 404, description: 'Usuario no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
