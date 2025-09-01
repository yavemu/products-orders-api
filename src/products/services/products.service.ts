import { Injectable, BadRequestException } from '@nestjs/common';
import {
  SearchProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  DeleteProductResponseDto,
} from '../dto';
import { CreateProductRequest, UpdateProductRequest } from '../interfaces';
import { ProductsRepository } from '../repository/products.repository';
import { Product } from '../schemas/product.schema';
import { HttpResponseUtil } from '../../common/utils';
import { PaginatedData } from '../../common/interfaces';
import { ProductMessages } from '../enums';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductRequest): Promise<ProductResponseDto> {
    const product = await this.productsRepository.create(createProductDto);
    return this.mapToDto(product);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOneById(id);
    return this.mapToDto(product);
  }

  async findAll(): Promise<PaginatedData<ProductResponseDto>> {
    const products = await this.productsRepository.findAll();
    const productDtos = products.map(product => this.mapToDto(product));
    return HttpResponseUtil.createListResponse(productDtos);
  }

  async update(id: string, updateProductDto: UpdateProductRequest): Promise<ProductResponseDto> {
    const updatedProduct = await this.productsRepository.updateById(id, updateProductDto);
    return this.mapToDto(updatedProduct);
  }

  async remove(id: string): Promise<DeleteProductResponseDto> {
    return this.productsRepository.deleteById(id);
  }

  async search(searchDto: SearchProductDto): Promise<PaginatedData<ProductResponseDto>> {
    const result = await this.productsRepository.search(searchDto);
    return HttpResponseUtil.processPaginatedResult(result, (product: Product) =>
      this.mapToDto(product),
    );
  }

  async findManyByIds(ids: string[]): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.findManyByIds(ids);
    return products.map(product => this.mapToDto(product));
  }

  async createWithFile(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    if (!file) {
      throw new BadRequestException(ProductMessages.PICTURE_REQUIRED);
    }

    const productData: CreateProductRequest = {
      ...createProductDto,
      picture: file.path,
    };

    return this.create(productData);
  }

  async updateWithFile(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const updateData: UpdateProductRequest = {
      ...updateProductDto,
      ...(file && { picture: file.path }),
    };

    return this.update(id, updateData);
  }

  private mapToDto(product: Product): ProductResponseDto {
    return {
      id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      price: product.price,
      picture: product.picture,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
