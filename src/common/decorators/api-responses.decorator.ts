import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { StandardResponseDto, StandardListResponseDto, ErrorResponseDto } from '../dto';

interface ApiResponsesConfig {
  success?: {
    status: number;
    description: string;
    type?: Type<any>;
    isArray?: boolean;
  };
  errors?: Array<{
    status: number;
    description: string;
  }>;
}

export function ApiStandardResponses(config: ApiResponsesConfig) {
  const decorators = [];

  if (config.success) {
    const { status, description, type, isArray } = config.success;

    if (isArray) {
      decorators.push(
        ApiResponse({
          status,
          description,
          type: StandardListResponseDto,
          schema: {
            allOf: [
              { $ref: '#/components/schemas/StandardListResponseDto' },
              {
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: type
                          ? { $ref: `#/components/schemas/${type.name}` }
                          : { type: 'object' },
                      },
                      meta: { $ref: '#/components/schemas/PaginationMetaDto' },
                    },
                  },
                },
              },
            ],
          },
        }),
      );
    } else {
      decorators.push(
        ApiResponse({
          status,
          description,
          type: StandardResponseDto,
          schema: {
            allOf: [
              { $ref: '#/components/schemas/StandardResponseDto' },
              type
                ? {
                    properties: {
                      data: { $ref: `#/components/schemas/${type.name}` },
                    },
                  }
                : {},
            ],
          },
        }),
      );
    }
  }

  if (config.errors) {
    config.errors.forEach(error => {
      decorators.push(
        ApiResponse({
          status: error.status,
          description: error.description,
          type: ErrorResponseDto,
        }),
      );
    });
  }

  return applyDecorators(...decorators);
}

export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Solicitud inválida - Errores de validación en los datos enviados',
      type: ErrorResponseDto,
      schema: {
        example: {
          statusCode: 400,
          message: ['El campo es requerido', 'El formato no es válido'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Token JWT inválido o no proporcionado',
      type: ErrorResponseDto,
      schema: {
        example: {
          statusCode: 401,
          message: 'No autorizado',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Prohibido - No tienes permisos para realizar esta acción',
      type: ErrorResponseDto,
      schema: {
        example: {
          statusCode: 403,
          message: 'Operación no permitida',
          error: 'Forbidden',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      type: ErrorResponseDto,
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno del servidor',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
