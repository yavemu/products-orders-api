import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { UpdateOrderDto, OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function UpdateOrderDecorator() {
  return applyDecorators(
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
      errors: [
        { status: 404, description: 'Orden no encontrada' },
        { status: 403, description: 'No se puede modificar una orden completada o cancelada' },
        { status: 400, description: 'Transición de estado no válida' },
      ],
    }),
    ApiCommonErrorResponses(),
  );
}
