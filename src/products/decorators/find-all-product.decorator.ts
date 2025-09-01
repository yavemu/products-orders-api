import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindAllProductDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los productos',
      description: 'Recupera una lista de todos los productos en la base de datos',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Lista de productos obtenida exitosamente',
        type: ProductResponseDto,
        isArray: true,
      },
    }),
    ApiCommonErrorResponses(),
  );
}
