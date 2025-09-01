import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SearchOrderDto, OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function SearchOrderDecorator() {
  return applyDecorators(
    
    ApiOperation({
      summary: 'Buscar órdenes',
      description:
        'Buscar órdenes por nombre de cliente, identificador, estado, rango total con soporte de paginación.',
    }),
    ApiBody({ type: SearchOrderDto }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Búsqueda de órdenes completada exitosamente',
        type: OrderResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
