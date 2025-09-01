import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { RepositoryUtil } from '../../common/utils';
import { ProductMessages } from '../enums';

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(productData: Partial<Product>): Promise<any> {
    await RepositoryUtil.checkNotExists(
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
    return RepositoryUtil.executeFindByWhereCondition(this.productModel, whereCondition, options);
  }

  async updateById(id: string, updateData: Partial<Product>): Promise<any> {
    RepositoryUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<any> {
    RepositoryUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    // Soft delete - marcar como inactivo
    return this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }
}
