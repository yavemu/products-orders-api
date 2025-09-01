import { Injectable } from '@nestjs/common';
import { SearchProductDto } from '../dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { CreateProductRequest, UpdateProductRequest } from '../interfaces';
import { ProductsRepository } from '../repository/products.repository';
import { Product } from '../schemas/product.schema';
import { ServiceUtil } from '../../common/utils';
import { PaginatedData } from '../../common/interfaces';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductRequest): Promise<ProductResponseDto> {
    const createdProduct = await this.productsRepository.create(createProductDto);
    return this.mapToDto(createdProduct);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = (await this.productsRepository.findByWhereCondition({ _id: id })) as Product;
    return this.mapToDto(product);
  }

  async findAll(): Promise<PaginatedData<ProductResponseDto>> {
    const products = (await this.productsRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as Product[];
    const productDtos = products.map(product => this.mapToDto(product));
    return ServiceUtil.createListResponse(productDtos);
  }

  async update(id: string, updateProductDto: UpdateProductRequest): Promise<ProductResponseDto> {
    const updatedProduct = await this.productsRepository.updateById(id, updateProductDto);
    return this.mapToDto(updatedProduct);
  }

  async remove(id: string): Promise<ProductResponseDto> {
    const deletedProduct = await this.productsRepository.deleteById(id);
    return this.mapToDto(deletedProduct);
  }

  async search(searchDto: SearchProductDto): Promise<PaginatedData<ProductResponseDto>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = ServiceUtil.buildSearchFilter({
      name: searchDto.name,
      sku: searchDto.sku,
      minPrice: searchDto.minPrice,
      maxPrice: searchDto.maxPrice,
    });

    const result = await this.productsRepository.findByWhereCondition(filter, { page, limit });
    return ServiceUtil.processPaginatedResult(result, (product: Product) => this.mapToDto(product));
  }

  async findManyByIds(ids: string[]): Promise<ProductResponseDto[]> {
    const products = (await this.productsRepository.findByWhereCondition(
      { _id: { $in: ids } },
      { multiple: true },
    )) as Product[];
    return products.map(product => this.mapToDto(product));
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
