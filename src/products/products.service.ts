import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const createdProduct = await this.productModel.create(createProductDto);
    return this.mapToDto(createdProduct as any);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.mapToDto(product as any);
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productModel.find().exec();
    // @ts-ignore
    return products.map((product: ProductDocument) => this.mapToDto(product));
  }

  async findManyByIds(ids: string[]): Promise<ProductResponseDto[]> {
    const products = await this.productModel.find({
      _id: { $in: ids }
    }).exec();
    // @ts-ignore
    return products.map((product: ProductDocument) => this.mapToDto(product));
  }

  private mapToDto(product: ProductDocument): ProductResponseDto {
    const productObj = product.toObject();
    return {
      id: productObj._id.toString(),
      name: productObj.name,
      sku: productObj.sku,
      price: productObj.price,
      picture: productObj.picture,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt,
    };
  }
}
