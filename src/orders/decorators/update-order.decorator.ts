import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOrderDto, OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function UpdateOrderDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Actualizar una orden',
      description:
        'Actualiza una orden existente. Puede modificar nombre del cliente, productos o estado de la orden. Todos los campos son opcionales.',
    }),
    ApiBody({ type: UpdateOrderDto }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Orden actualizada exitosamente',
        type: OrderResponseDto,
      },
      errors: [{ status: 404, description: 'Orden no encontrada' }],
    }),
    ApiCommonErrorResponses(),
  );
}
