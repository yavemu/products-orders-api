import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto, SearchOrderDto } from '../dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrdersRepository } from '../repository/orders.repository';
import { ProductsService } from '../../products/services/products.service';
import { Order } from '../schemas/order.schema';
import { Types } from 'mongoose';
import { ServiceUtil } from '../../common/utils';
import { PaginatedData } from '../../common/interfaces';
import { OrderMessages } from '../enums';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const orderProducts = await this.calculateOrderProducts(createOrderDto.products);
    const total = orderProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);

    const orderIdentifier = this.generateOrderIdentifier();

    const orderData = {
      identifier: orderIdentifier,
      clientName: createOrderDto.clientName,
      total,
      products: orderProducts,
      status: 'pending',
    };

    const createdOrder = await this.ordersRepository.create(orderData);
    return this.mapToDto(createdOrder);
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = (await this.ordersRepository.findByWhereCondition({ _id: id })) as Order;
    return this.mapToDto(order);
  }

  async findAll(): Promise<PaginatedData<OrderResponseDto>> {
    const orders = (await this.ordersRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as Order[];
    const orderDtos = orders.map(order => this.mapToDto(order));
    return ServiceUtil.createListResponse(orderDtos);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const updateData: Record<string, unknown> = {};

    if (updateOrderDto.clientName) {
      updateData.clientName = updateOrderDto.clientName;
    }

    if (updateOrderDto.status) {
      updateData.status = updateOrderDto.status;
    }

    if (updateOrderDto.products) {
      const orderProducts = await this.calculateOrderProducts(updateOrderDto.products);
      const total = orderProducts.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
      );

      updateData.products = orderProducts;
      updateData.total = total;
    }

    const updatedOrder = await this.ordersRepository.updateById(id, updateData);
    return this.mapToDto(updatedOrder);
  }

  async remove(id: string): Promise<OrderResponseDto> {
    const deletedOrder = await this.ordersRepository.deleteById(id);
    return this.mapToDto(deletedOrder);
  }

  async search(searchDto: SearchOrderDto): Promise<PaginatedData<OrderResponseDto>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = ServiceUtil.buildSearchFilter({
      clientName: searchDto.clientName,
      identifier: searchDto.identifier,
      status: searchDto.status,
      minTotal: searchDto.minTotal,
      maxTotal: searchDto.maxTotal,
    });

    const result = await this.ordersRepository.findByWhereCondition(filter, { page, limit });
    return ServiceUtil.processPaginatedResult(result, (order: Order) => this.mapToDto(order));
  }

  private async calculateOrderProducts(
    products: { productId: string; quantity: number }[],
  ): Promise<{ productId: Types.ObjectId; quantity: number; price: number; name: string }[]> {
    const productIds = products.map(p => p.productId);
    const productDetails = await this.productsService.findManyByIds(productIds);

    if (productDetails.length !== productIds.length) {
      throw new NotFoundException(OrderMessages.INVALID_PRODUCT_ID);
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

  private mapToDto(order: Order): OrderResponseDto {
    return {
      id: order._id.toString(),
      identifier: order.identifier,
      clientName: order.clientName,
      total: order.total,
      status: order.status,
      products: order.products.map(product => ({
        ...product,
        productId: product.productId.toString(),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
