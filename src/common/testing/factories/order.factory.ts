import { Types } from 'mongoose';
import { Order } from '../../../orders/schemas/order.schema';
import { ProductFactory } from './product.factory';
import { UserFactory } from './user.factory';

export class OrderFactory {
  static create(overrides?: Partial<Order>): Order {
    const productCount = Math.floor(Math.random() * 4) + 1;
    const products = Array.from({ length: productCount }, () => {
      const product = ProductFactory.create();
      const quantity = Math.floor(Math.random() * 5) + 1;
      return {
        productId: product._id,
        quantity,
        price: product.price,
        name: product.name,
      };
    });

    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();

    const order = {
      _id: new Types.ObjectId(),
      identifier: `ORD-${new Date().getFullYear()}-${randomId}`,
      clientId: new Types.ObjectId(),
      clientName: `Client ${Math.random().toString(36).substr(2, 6)}`,
      total: parseFloat(total.toFixed(2)),
      totalQuantity,
      products,
      status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    } as Order;

    return order;
  }

  static createMany(count: number, overrides?: Partial<Order>): Order[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createWithStatus(status: string, overrides?: Partial<Order>): Order {
    return this.create({
      status,
      ...overrides,
    });
  }

  static createWithClient(clientId: Types.ObjectId, clientName: string, overrides?: Partial<Order>): Order {
    return this.create({
      clientId,
      clientName,
      ...overrides,
    });
  }

  static createWithProducts(products: any[], overrides?: Partial<Order>): Order {
    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    return this.create({
      products,
      total: parseFloat(total.toFixed(2)),
      totalQuantity,
      ...overrides,
    });
  }

  static createHighValue(overrides?: Partial<Order>): Order {
    const productCount = Math.floor(Math.random() * 4) + 2;
    const products = Array.from({ length: productCount }, () => {
      const product = ProductFactory.createWithHighPrice();
      const quantity = Math.floor(Math.random() * 2) + 2;
      return {
        productId: product._id,
        quantity,
        price: product.price,
        name: product.name,
      };
    });

    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

    return this.create({
      products,
      total: parseFloat(total.toFixed(2)),
      totalQuantity,
      ...overrides,
    });
  }

  static createDto(overrides?: any) {
    const user = UserFactory.createClient();
    const productCount = Math.floor(Math.random() * 3) + 1;
    const products = Array.from({ length: productCount }, () => ({
      productId: new Types.ObjectId().toString(),
      quantity: Math.floor(Math.random() * 3) + 1,
    }));

    return {
      clientId: user._id.toString(),
      clientName: `${user.firstName} ${user.lastName}`,
      products,
      ...overrides,
    };
  }

  static createResponseDto(order?: Order) {
    const baseOrder = order || this.create();
    return {
      id: baseOrder._id.toString(),
      identifier: baseOrder.identifier,
      clientId: baseOrder.clientId.toString(),
      clientName: baseOrder.clientName,
      total: baseOrder.total,
      totalQuantity: baseOrder.totalQuantity,
      status: baseOrder.status,
      products: baseOrder.products.map(p => ({
        productId: p.productId.toString(),
        quantity: p.quantity,
        price: p.price,
        name: p.name,
      })),
      createdAt: baseOrder.createdAt,
      updatedAt: baseOrder.updatedAt,
    };
  }

  static createUpdateDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 6);
    return {
      clientName: `Updated Client ${randomId}`,
      status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
      ...overrides,
    };
  }

  static createSearchDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 6);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();

    return {
      clientName: `Search Client ${randomId}`,
      status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      page: 1,
      limit: 10,
      ...overrides,
    };
  }

  static createReportsDto(overrides?: any) {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    const endDate = new Date();

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      sortBy: 'total_desc',
      returnCsv: false,
      page: 1,
      limit: 10,
      ...overrides,
    };
  }

  static createList(count: number, overrides?: Partial<Order>): Order[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}