import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

export class DatabaseUtil {
  static validateObjectId(id: string, entityName: string = 'documento'): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`ID de ${entityName} inválido`);
    }
  }

  static toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  static async checkExists(
    model: any,
    condition: Record<string, any>,
    entityName: string = 'documento',
  ): Promise<any> {
    const entity = await model.findOne(condition).exec();
    if (!entity) {
      throw new NotFoundException(`${entityName} no encontrado`);
    }
    return entity;
  }

  static async checkNotExists<T>(
    findMethod: () => Promise<T>,
    errorMessage: string,
  ): Promise<void> {
    const existing = await findMethod();
    if (existing) {
      throw new ConflictException(errorMessage);
    }
  }

  static async executeFindByWhereCondition(
    model: any,
    whereCondition: Record<string, any> = {},
    options?: {
      page?: number;
      limit?: number;
      select?: string;
      multiple?: boolean;
      sort?: Record<string, any>;
      includeInactive?: boolean;
    },
  ): Promise<any> {
    const {
      page,
      limit,
      select,
      multiple = false,
      sort = {},
      includeInactive = false,
    } = options || {};

    // Apply default filter for active records if needed
    let filter: Record<string, any> = whereCondition;
    if (!includeInactive) {
      const schema = model.schema;
      if (schema.paths.isActive) {
        filter = { ...whereCondition, isActive: true };
      }
    }

    // Paginated query
    if (page && limit) {
      const skip = (page - 1) * limit;
      const query = model.find(filter);
      if (select) query.select(select);
      if (Object.keys(sort).length > 0) query.sort(sort);

      const data = await query.skip(skip).limit(limit).exec();
      const total = await model.countDocuments(filter).exec();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Multiple records query
    if (multiple) {
      const query = model.find(filter);
      if (select) query.select(select);
      if (Object.keys(sort).length > 0) query.sort(sort);
      return query.exec();
    }

    // Single record query
    const query = model.findOne(filter);
    if (select) query.select(select);
    return query.exec();
  }

  static buildSearchFilter(searchParams: Record<string, any>): Record<string, any> {
    const filter: Record<string, any> = {};

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && !key.includes('Id')) {
          // Text search with regex
          filter[key] = { $regex: value, $options: 'i' };
        } else if (key.includes('min') || key.includes('max')) {
          // Range queries
          const fieldName = key.replace(/^(min|max)/, '').toLowerCase();
          if (!filter[fieldName]) {
            filter[fieldName] = {};
          }
          if (key.startsWith('min')) {
            filter[fieldName].$gte = value;
          } else if (key.startsWith('max')) {
            filter[fieldName].$lte = value;
          }
        } else {
          // Exact match
          filter[key] = value;
        }
      }
    });

    return filter;
  }
}
