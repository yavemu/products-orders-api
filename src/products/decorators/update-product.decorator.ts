import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function UpdateProductDecorator() {
  return applyDecorators(
    
    ApiConsumes('multipart/form-data'),
    ApiOperation({
      summary: 'Actualizar un producto',
      description:
        'Actualiza un producto existente. Puede modificar nombre, precio o imagen del producto. Todos los campos son opcionales.',
    }),
    ApiStandardResponses({
      success: {
        status: 200,
        description: 'Producto actualizado exitosamente',
        type: ProductResponseDto,
      },
      errors: [{ status: 404, description: 'Producto no encontrado' }],
    }),
    ApiCommonErrorResponses(),
  );
}
