import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateOrderDto, OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function CreateOrderDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Crear una nueva orden',
      description:
        'Crea una nueva orden con nombre del cliente y productos. Valida que todos los productos existan y calcula el total automáticamente.',
    }),
    ApiBody({ type: CreateOrderDto }),
    ApiStandardResponses({
      success: {
        status: 201,
        description: 'Orden creada exitosamente',
        type: OrderResponseDto,
      },
      errors: [{ status: 404, description: 'Productos no encontrados' }],
    }),
    ApiCommonErrorResponses(),
  );
}
