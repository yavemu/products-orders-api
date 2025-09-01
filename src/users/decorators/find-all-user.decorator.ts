import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindAllUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Obtener todos los usuarios',
      description: 'Retorna una lista de todos los usuarios del sistema.',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
        type: UserResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
