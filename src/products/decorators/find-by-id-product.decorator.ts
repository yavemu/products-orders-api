import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function FindByIdProductDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener producto por ID',
      description: 'Recupera un producto único por su ObjectId de MongoDB',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Producto encontrado exitosamente',
        type: ProductResponseDto,
      },
      errors: [{ status: 404, description: 'Producto no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
