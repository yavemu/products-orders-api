import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { SearchUserDto, UserResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function SearchUserDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Buscar usuarios',
      description: 'Busca usuarios por nombre, apellido o email.',
    }),
    ApiBody({ type: SearchUserDto }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Búsqueda de usuarios completada exitosamente',
        type: UserResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
