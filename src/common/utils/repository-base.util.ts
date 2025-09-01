import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { DatabaseUtil, HttpResponseUtil } from './';

export class RepositoryBaseUtil {
  /**
   * Método genérico para findOneById
   */
  static async findOneById<T>(
    model: Model<any>,
    id: string,
    invalidIdMessage: string,
    notFoundMessage: string,
    findByWhereCondition: (condition: Record<string, any>) => Promise<T | null>,
  ): Promise<T> {
    DatabaseUtil.validateObjectId(id, invalidIdMessage);
    const entity = await findByWhereCondition({ _id: id });

    if (!entity) {
      throw new NotFoundException(notFoundMessage);
    }

    return entity;
  }

  /**
   * Método genérico para findAll
   */
  static async findAll<T>(
    findByWhereCondition: (condition: Record<string, any>, options?: any) => Promise<T[]>,
  ): Promise<T[]> {
    return findByWhereCondition({}, { multiple: true });
  }

  /**
   * Método genérico para search con paginación
   */
  static async search<T>(
    searchDto: { page?: number; limit?: number; [key: string]: any },
    searchFields: Record<string, any>,
    findByWhereCondition: (condition: Record<string, any>, options?: any) => Promise<any>,
  ): Promise<any> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = HttpResponseUtil.buildSearchFilter(searchFields);

    return findByWhereCondition(filter, { page, limit });
  }

  /**
   * Método genérico para deleteById con mensaje personalizado
   */
  static async deleteById<T>(
    model: Model<any>,
    id: string,
    invalidIdMessage: string,
    notFoundMessage: string,
    successMessage: string,
    softDelete: boolean = false,
  ): Promise<T> {
    DatabaseUtil.validateObjectId(id, invalidIdMessage);
    await DatabaseUtil.checkExists(model, { _id: id }, notFoundMessage);

    if (softDelete) {
      await model.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    } else {
      await model.findByIdAndDelete(id).exec();
    }

    return {
      message: successMessage,
    } as T;
  }

  /**
   * Método genérico para updateById con validación
   */
  static async updateById<T>(
    model: Model<any>,
    id: string,
    updateData: Partial<any>,
    invalidIdMessage: string,
    notFoundMessage: string,
    validateData?: (data: Partial<any>, isUpdate: boolean) => void,
    selectFields?: string,
  ): Promise<T> {
    if (validateData) {
      validateData(updateData, true);
    }

    DatabaseUtil.validateObjectId(id, invalidIdMessage);
    await DatabaseUtil.checkExists(model, { _id: id }, notFoundMessage);

    const query = model.findByIdAndUpdate(id, updateData, { new: true });
    if (selectFields) {
      query.select(selectFields);
    }

    return query.exec();
  }

  /**
   * Método genérico para create con validación
   */
  static async create<T>(
    model: Model<any>,
    createData: Partial<any>,
    validateData?: (data: Partial<any>, isUpdate: boolean) => void,
    checkDuplicates?: () => Promise<any>,
    duplicateMessage?: string,
  ): Promise<T> {
    if (validateData) {
      validateData(createData, false);
    }

    if (checkDuplicates && duplicateMessage) {
      await DatabaseUtil.checkNotExists(checkDuplicates, duplicateMessage);
    }

    const entity = new model(createData);
    return entity.save();
  }
}
