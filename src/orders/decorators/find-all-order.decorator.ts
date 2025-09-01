import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindAllOrderDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Obtener todas las órdenes',
      description: 'Recupera una lista de todas las órdenes en la base de datos',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Lista de órdenes obtenida exitosamente',
        type: OrderResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
