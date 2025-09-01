import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { DatabaseUtil } from '../../common/utils';
import { ProductMessages } from '../enums';

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(productData: Partial<Product>): Promise<any> {
    // Validar que el precio sea mayor a 0
    if (productData.price <= 0) {
      throw new BadRequestException(ProductMessages.INVALID_PRICE);
    }

    // Validar que el SKU tenga formato adecuado
    if (!this.isValidSku(productData.sku)) {
      throw new BadRequestException(ProductMessages.INVALID_SKU);
    }

    await DatabaseUtil.checkNotExists(
      () => this.findByWhereCondition({ sku: productData.sku }),
      ProductMessages.ALREADY_EXISTS,
    );

    const product = new this.productModel(productData);
    return await product.save();
  }

  async findByWhereCondition(
    whereCondition: Record<string, any> = {},
    options?: {
      page?: number;
      limit?: number;
      select?: string;
      multiple?: boolean;
      includeInactive?: boolean;
    },
  ): Promise<any> {
    return DatabaseUtil.executeFindByWhereCondition(this.productModel, whereCondition, options);
  }

  async updateById(id: string, updateData: Partial<Product>): Promise<any> {
    // Validar precio si se está actualizando
    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new BadRequestException(ProductMessages.INVALID_PRICE);
    }

    // Validar SKU si se está actualizando
    if (updateData.sku && !this.isValidSku(updateData.sku)) {
      throw new BadRequestException(ProductMessages.INVALID_SKU);
    }

    DatabaseUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<any> {
    DatabaseUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    // Soft delete - marcar como inactivo
    return this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  private isValidSku(sku: string): boolean {
    // SKU debe contener solo letras mayúsculas, números y guiones
    const skuRegex = /^[A-Z0-9-]+$/;
    return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50;
  }
}
