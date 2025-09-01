import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SearchProductDto, ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function SearchProductDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar productos',
      description: 'Buscar productos por nombre, SKU, rango de precios con soporte de paginación.',
    }),
    ApiBody({ type: SearchProductDto }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Búsqueda de productos completada exitosamente',
        type: ProductResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
