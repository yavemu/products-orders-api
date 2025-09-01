import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ProductResponseDto } from '../dto';
import {
  ApiStandardResponses,
  ApiCommonErrorResponses,
} from '../../common/decorators/api-responses.decorator';

export function CreateProductDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiOperation({
      summary: 'Crear un nuevo producto',
      description:
        'Crea un nuevo producto con nombre, SKU, precio e imagen. La imagen del producto es requerida.',
    }),
    ApiStandardResponses({
      success: {
        status: 201,
        description: 'Producto creado exitosamente',
        type: ProductResponseDto,
      },
      errors: [{ status: 409, description: 'Ya existe un producto con este SKU' }],
    }),
    ApiCommonErrorResponses(),
  );
}
