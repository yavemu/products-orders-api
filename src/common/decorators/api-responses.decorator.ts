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
      status: 401,
      description: 'No autorizado',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Error de validación',
      type: ErrorResponseDto,
    }),
  );
}
