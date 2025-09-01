import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SearchProductDto, CreateProductDto, UpdateProductDto, ProductResponseDto } from '../dto';
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
    const product = (await this.productsRepository.findByWhereCondition({ _id: id })) as Product;
    if (!product) {
      throw new NotFoundException(ProductMessages.NOT_FOUND);
    }
    return this.mapToDto(product);
  }

  async findAll(): Promise<PaginatedData<ProductResponseDto>> {
    const products = (await this.productsRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as Product[];
    const productDtos = products.map(product => this.mapToDto(product));
    return HttpResponseUtil.createListResponse(productDtos);
  }

  async update(id: string, updateProductDto: UpdateProductRequest): Promise<ProductResponseDto> {
    const updatedProduct = await this.productsRepository.updateById(id, updateProductDto);
    return this.mapToDto(updatedProduct);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.productsRepository.deleteById(id);
    return {
      message: ProductMessages.DELETED_SUCCESS,
    };
  }

  async search(searchDto: SearchProductDto): Promise<PaginatedData<ProductResponseDto>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = HttpResponseUtil.buildSearchFilter({
      name: searchDto.name,
      sku: searchDto.sku,
      minPrice: searchDto.minPrice,
      maxPrice: searchDto.maxPrice,
    });

    const result = await this.productsRepository.findByWhereCondition(filter, { page, limit });
    return HttpResponseUtil.processPaginatedResult(result, (product: Product) =>
      this.mapToDto(product),
    );
  }

  async findManyByIds(ids: string[]): Promise<ProductResponseDto[]> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Se requiere al menos un ID de producto');
    }

    const products = (await this.productsRepository.findByWhereCondition(
      { _id: { $in: ids } },
      { multiple: true },
    )) as Product[];

    // Verificar que se encontraron todos los productos solicitados
    if (products.length !== ids.length) {
      throw new NotFoundException('Algunos productos no fueron encontrados');
    }

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
