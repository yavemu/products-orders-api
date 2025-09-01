import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderReportsDto, OrderReportsResponseDto } from '../dto';

export function OrderReportsDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generar reporte de órdenes',
      description: `
        Genera un reporte detallado de órdenes con filtros avanzados.
        
        **Características:**
        - Rango de fechas obligatorio
        - Filtros opcionales por cliente y/o producto
        - Ordenamiento configurable (por defecto: total descendente)
        - Exportación a CSV o JSON
        - Paginación para respuestas JSON
        - Resumen estadístico incluido
        
        **Filtros disponibles:**
        - Por rango de fechas (obligatorio)
        - Por cliente específico (opcional)
        - Por producto específico (opcional)
        
        **Ordenamiento disponible:**
        - total_desc/total_asc: Por monto total
        - date_desc/date_asc: Por fecha de creación
        - quantity_desc/quantity_asc: Por cantidad total
        - client_name_asc/client_name_desc: Por nombre de cliente
      `,
    }),
    ApiBody({
      type: OrderReportsDto,
      description: 'Filtros y configuración del reporte',
    }),
    ApiResponse({
      status: 200,
      description: 'Reporte generado exitosamente (JSON)',
      type: OrderReportsResponseDto,
      schema: {
        example: {
          data: [
            {
              orderId: '507f1f77bcf86cd799439011',
              identifier: 'ORD-20250101-ABC123',
              clientId: '507f1f77bcf86cd799439012',
              clientName: 'Juan Pérez García',
              total: 1299.99,
              totalQuantity: 2,
              status: 'delivered',
              createdAt: '2025-01-15T10:30:00Z',
              products: [
                {
                  productId: '507f1f77bcf86cd799439013',
                  name: 'iPhone 14 Pro',
                  quantity: 1,
                  price: 1299.99,
                },
              ],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          filters: {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            sortBy: 'total_desc',
          },
          summary: {
            totalOrders: 1,
            totalRevenue: 1299.99,
            totalQuantitySold: 2,
            averageOrderValue: 1299.99,
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Reporte generado exitosamente (CSV)',
      content: {
        'text/csv': {
          schema: {
            type: 'string',
            example:
              'ID Orden,Identificador,ID Cliente,Nombre Cliente,Total,Cantidad Total,Estado,Fecha Creación,Productos\n507f1f77bcf86cd799439011,ORD-20250101-ABC123,507f1f77bcf86cd799439012,Juan Pérez García,1299.99,2,delivered,2025-01-15T10:30:00.000Z,"507f1f77bcf86cd799439013:iPhone 14 Pro:1:1299.99"',
          },
        },
      },
      headers: {
        'Content-Type': {
          description: 'Tipo de contenido',
          schema: { type: 'string', example: 'text/csv; charset=utf-8' },
        },
        'Content-Disposition': {
          description: 'Disposición del archivo',
          schema: {
            type: 'string',
            example: 'attachment; filename="order-reports-2025-01-01.csv"',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Solicitud inválida - Errores de validación',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'La fecha de inicio es requerida',
            'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)',
            'El ID del cliente debe ser un ObjectId válido',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token JWT requerido',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Error de lógica de negocio',
      schema: {
        example: {
          statusCode: 422,
          message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
          error: 'Unprocessable Entity',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno al generar el reporte',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
