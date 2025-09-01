import { Types } from 'mongoose';
import { Product } from '../../../products/schemas/product.schema';

export class ProductFactory {
  static create(overrides?: Partial<Product>): Product {
    const randomId = Math.random().toString(36).substr(2, 9);
    const product = {
      _id: new Types.ObjectId(),
      name: `Product ${randomId}`,
      sku: `SKU-${randomId.toUpperCase()}`,
      price: Math.round((Math.random() * 1990 + 10) * 100) / 100,
      picture: `https://example.com/product-${randomId}.jpg`,
      isActive: Math.random() > 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Product;

    return product;
  }

  static createMany(count: number, overrides?: Partial<Product>): Product[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createActive(overrides?: Partial<Product>): Product {
    return this.create({
      isActive: true,
      ...overrides,
    });
  }

  static createWithHighPrice(overrides?: Partial<Product>): Product {
    return this.create({
      price: Math.round((Math.random() * 4000 + 1000) * 100) / 100,
      ...overrides,
    });
  }

  static createDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      name: `Product ${randomId}`,
      sku: `SKU-${randomId.toUpperCase()}`,
      price: Math.round((Math.random() * 1990 + 10) * 100) / 100,
      ...overrides,
    };
  }

  static createResponseDto(product?: Product) {
    const baseProduct = product || this.create();
    return {
      id: baseProduct._id.toString(),
      name: baseProduct.name,
      sku: baseProduct.sku,
      price: baseProduct.price,
      picture: baseProduct.picture,
      isActive: baseProduct.isActive,
      createdAt: baseProduct.createdAt,
      updatedAt: baseProduct.updatedAt,
    };
  }

  static createUpdateDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      name: `Updated Product ${randomId}`,
      price: Math.round((Math.random() * 1990 + 10) * 100) / 100,
      ...overrides,
    };
  }

  static createSearchDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      name: `Search Product ${randomId}`,
      minPrice: 10,
      maxPrice: 1000,
      isActive: true,
      page: 1,
      limit: 10,
      ...overrides,
    };
  }
}