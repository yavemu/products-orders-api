import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function DeleteProductDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Eliminar un producto',
      description:
        'Elimina suavemente un producto marcándolo como inactivo. El producto ya no aparecerá en las listas.',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Producto eliminado exitosamente',
        type: ProductResponseDto,
      },
      errors: [{ status: 404, description: 'Producto no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
