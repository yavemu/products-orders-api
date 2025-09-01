import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { DatabaseUtil, RepositoryBaseUtil } from '../../common/utils';
import { ProductMessages } from '../enums';
import { SearchProductDto, DeleteProductResponseDto } from '../dto';

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(productData: Partial<Product>): Promise<any> {
    this.validateProductData(productData, false);

    const existing = await this.findByWhereCondition({ sku: productData.sku });
    if (existing) {
      throw new BadRequestException(ProductMessages.ALREADY_EXISTS);
    }

    const product = new this.productModel(productData);
    return product.save();
  }

  async findAll(): Promise<Product[]> {
    return RepositoryBaseUtil.findAll(this.findByWhereCondition.bind(this));
  }

  async findOneById(id: string): Promise<Product> {
    DatabaseUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    const product = await this.findByWhereCondition({ _id: id });

    if (!product) {
      throw new NotFoundException(ProductMessages.NOT_FOUND);
    }

    return product;
  }

  async search(searchDto: SearchProductDto): Promise<any> {
    return RepositoryBaseUtil.search(
      searchDto,
      {
        name: searchDto.name,
        sku: searchDto.sku,
        minPrice: searchDto.minPrice,
        maxPrice: searchDto.maxPrice,
      },
      this.findByWhereCondition.bind(this),
    );
  }

  async findManyByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException(ProductMessages.INVALID_PRODUCTS);
    }

    const products = (await this.findByWhereCondition(
      { _id: { $in: ids } },
      { multiple: true },
    )) as Product[];

    if (products.length !== ids.length) {
      throw new NotFoundException('Algunos productos no fueron encontrados');
    }

    return products;
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
    this.validateProductData(updateData, true);

    DatabaseUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    return this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<DeleteProductResponseDto> {
    DatabaseUtil.validateObjectId(id, ProductMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.productModel, { _id: id }, ProductMessages.NOT_FOUND);

    await this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    return {
      message: ProductMessages.DELETED_SUCCESS,
    };
  }

  private validateProductData(productData: Partial<Product>, isUpdate: boolean = false): void {
    if (productData.price !== undefined && productData.price <= 0) {
      throw new BadRequestException(ProductMessages.INVALID_PRICE);
    }

    if (productData.sku && !this.isValidSku(productData.sku)) {
      throw new BadRequestException(ProductMessages.INVALID_SKU);
    }

    if (!isUpdate) {
      if (!productData.name?.trim()) {
        throw new BadRequestException(ProductMessages.NAME_REQUIRED);
      }

      if (!productData.sku?.trim()) {
        throw new BadRequestException(ProductMessages.SKU_REQUIRED);
      }

      if (productData.price === undefined) {
        throw new BadRequestException(ProductMessages.PRICE_REQUIRED);
      }
    }
  }

  private isValidSku(sku: string): boolean {
    const skuRegex = /^[A-Z0-9-]+$/;
    return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50;
  }
}
