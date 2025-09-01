import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const orderProducts = await this.calculateOrderProducts(createOrderDto.products);
    const total = orderProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const orderIdentifier = this.generateOrderIdentifier();
    
    const orderData = {
      identifier: orderIdentifier,
      clientName: createOrderDto.clientName,
      total,
      products: orderProducts,
      status: 'pending',
    };

    const createdOrder = await this.orderModel.create(orderData);
    return this.mapToDto(createdOrder as any);
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return this.mapToDto(order as any);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (updateOrderDto.products) {
      const orderProducts = await this.calculateOrderProducts(updateOrderDto.products);
      const total = orderProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
      
      order.products = orderProducts;
      order.total = total;
    }

    if (updateOrderDto.clientName) {
      order.clientName = updateOrderDto.clientName;
    }

    const updatedOrder = await order.save();
    return this.mapToDto(updatedOrder as any);
  }

  async getLastMonthTotal(): Promise<number> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$total' }
        }
      }
    ]);

    return result.length > 0 ? result[0].totalSold : 0;
  }

  async getHighestOrder(): Promise<OrderResponseDto> {
    const order = await this.orderModel
      .findOne()
      .sort({ total: -1 })
      .exec();

    if (!order) {
      throw new NotFoundException('No se encontraron pedidos');
    }

    return this.mapToDto(order as any);
  }

  private async calculateOrderProducts(products: { productId: string, quantity: number }[]): Promise<any[]> {
    const productIds = products.map(p => p.productId);
    const productDetails = await this.productsService.findManyByIds(productIds);

    if (productDetails.length !== productIds.length) {
      const foundIds = new Set(productDetails.map(p => p.id.toString()));
      const notFound = productIds.filter(id => !foundIds.has(id));
      throw new NotFoundException(`Productos no encontrados: ${notFound.join(', ')}`);
    }

    const productDetailsMap = new Map(productDetails.map(p => [p.id.toString(), p]));

    return products.map(p => {
      const detail = productDetailsMap.get(p.productId);
      return {
        productId: new Types.ObjectId(p.productId),
        quantity: p.quantity,
        price: detail.price,
        name: detail.name,
      };
    });
  }

  private generateOrderIdentifier(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `ORD-${year}${month}${day}-${random}`;
  }

  private mapToDto(order: OrderDocument): OrderResponseDto {
    const orderObj = order.toObject();
    return {
      id: orderObj._id.toString(),
      identifier: orderObj.identifier,
      clientName: orderObj.clientName,
      total: orderObj.total,
      status: orderObj.status,
      products: orderObj.products.map(product => ({
        ...product,
        productId: product.productId.toString(),
      })),
      createdAt: orderObj.createdAt,
      updatedAt: orderObj.updatedAt,
    };
  }
}
