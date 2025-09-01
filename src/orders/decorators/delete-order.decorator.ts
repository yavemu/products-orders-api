import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function DeleteOrderDecorator() {
  return applyDecorators(
    
    ApiOperation({
      summary: 'Eliminar una orden',
      description: 'Elimina una orden de la base de datos. Esta acción no se puede deshacer.',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Orden eliminada exitosamente',
        type: OrderResponseDto,
      },
      errors: [{ status: 404, description: 'Orden no encontrada' }],
    }),
    ApiCommonErrorResponses(),
  );
}
