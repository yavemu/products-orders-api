import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindByIdOrderDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener orden por ID',
      description:
        'Recupera una orden única por su ObjectId de MongoDB con todos los detalles del producto',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Orden encontrada exitosamente',
        type: OrderResponseDto,
      },
      errors: [{ status: 404, description: 'Orden no encontrada' }],
    }),
    ApiCommonErrorResponses(),
  );
}
