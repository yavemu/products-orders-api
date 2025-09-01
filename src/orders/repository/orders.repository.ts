import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { DatabaseUtil } from '../../common/utils';
import { OrderMessages } from '../enums';
import { OrderCalculationUtil } from '../utils';
import { ProductsService } from '../../products/services/products.service';
import { ProductMessages } from 'src/products/enums';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly productsService: ProductsService,
  ) {}

  async create(orderData: Partial<Order>): Promise<any> {
    // Validar que hay productos en la orden
    if (!orderData.products || orderData.products.length === 0) {
      throw new BadRequestException(ProductMessages.INVALID_PRODUCTS);
    }

    // Validar que todas las cantidades son positivas
    const invalidQuantities = orderData.products.filter(p => p.quantity <= 0);
    if (invalidQuantities.length > 0) {
      throw new BadRequestException(ProductMessages.INVALID_TOTAL_PRODUCT_PRICES);
    }

    const orderProducts = await this.calculateOrderProducts(orderData.products);
    const { total, totalQuantity } = OrderCalculationUtil.calculateOrderTotals(orderProducts);
    const orderIdentifier = OrderCalculationUtil.generateOrderIdentifier();

    const createOrderData = {
      identifier: orderIdentifier,
      clientId: new Types.ObjectId(orderData.clientId),
      clientName: orderData.clientName,
      total,
      totalQuantity,
      products: orderProducts,
      status: 'pending',
    };

    if (
      !createOrderData.clientId ||
      !createOrderData.products ||
      !createOrderData.products.length
    ) {
      throw new BadRequestException(OrderMessages.CREATE_ERROR);
    }

    const order = new this.orderModel(createOrderData);
    return order.save();
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
    return DatabaseUtil.executeFindByWhereCondition(this.orderModel, whereCondition, options);
  }

  async updateById(id: string, updateData: Partial<Order>): Promise<any> {
    // Verificar que la orden existe y obtener su estado actual
    const existingOrder = await this.findByWhereCondition({ _id: id });
    if (!existingOrder) {
      throw new NotFoundException(OrderMessages.NOT_FOUND);
    }

    // Validar que no se puede modificar una orden completada o cancelada
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
      throw new ForbiddenException('No se puede modificar una orden completada o cancelada');
    }

    if (updateData.clientId) {
      updateData.clientId = new Types.ObjectId(updateData.clientId);
    }

    if (updateData.clientName) {
      updateData.clientName = updateData.clientName;
    }

    if (updateData.status) {
      // Validar transiciones de estado permitidas
      if (!this.isValidStatusTransition(existingOrder.status, updateData.status)) {
        throw new BadRequestException(
          `No se puede cambiar el estado de ${existingOrder.status} a ${updateData.status}`,
        );
      }
      updateData.status = updateData.status;
    }

    if (updateData.products) {
      // Validar que hay productos y cantidades válidas
      if (updateData.products.length === 0) {
        throw new BadRequestException('La orden debe contener al menos un producto');
      }

      const invalidQuantities = updateData.products.filter(p => p.quantity <= 0);
      if (invalidQuantities.length > 0) {
        throw new BadRequestException('Todas las cantidades deben ser mayores a 0');
      }

      const orderProducts = await this.calculateOrderProducts(updateData.products);
      const { total, totalQuantity } = OrderCalculationUtil.calculateOrderTotals(orderProducts);

      updateData.products = orderProducts;
      updateData.total = total;
      updateData.totalQuantity = totalQuantity;
    }
    DatabaseUtil.validateObjectId(id, OrderMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.orderModel, { _id: id }, OrderMessages.NOT_FOUND);

    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<any> {
    DatabaseUtil.validateObjectId(id, OrderMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.orderModel, { _id: id }, OrderMessages.NOT_FOUND);

    return this.orderModel.findByIdAndDelete(id).exec();
  }

  async findOrdersForReports(filters: {
    startDate: Date;
    endDate: Date;
    clientId?: string;
    productId?: string;
    sortBy: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Order[]; total: number }> {
    const { startDate, endDate, clientId, productId, sortBy, page, limit } = filters;

    // Construir filtros
    const matchConditions: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (clientId) {
      matchConditions.clientId = DatabaseUtil.toObjectId(clientId);
    }

    if (productId) {
      matchConditions['products.productId'] = DatabaseUtil.toObjectId(productId);
    }

    // Construir ordenamiento
    const sortConditions = this.buildSortConditions(sortBy);

    // Pipeline de agregación para obtener datos y conteo
    const pipeline: any[] = [{ $match: matchConditions }, { $sort: sortConditions }];

    // Si se requiere paginación
    if (page && limit) {
      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    // Ejecutar consulta de datos
    const data = await this.orderModel.aggregate(pipeline).exec();

    // Obtener total de registros (sin paginación)
    const totalPipeline = [{ $match: matchConditions }, { $count: 'total' }];
    const totalResult = await this.orderModel.aggregate(totalPipeline).exec();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    return { data, total };
  }

  async getOrdersSummary(filters: {
    startDate: Date;
    endDate: Date;
    clientId?: string;
    productId?: string;
  }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalQuantitySold: number;
    averageOrderValue: number;
  }> {
    const { startDate, endDate, clientId, productId } = filters;

    const matchConditions: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (clientId) {
      matchConditions.clientId = DatabaseUtil.toObjectId(clientId);
    }

    if (productId) {
      matchConditions['products.productId'] = DatabaseUtil.toObjectId(productId);
    }

    const pipeline = [
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalQuantitySold: { $sum: '$totalQuantity' },
          averageOrderValue: { $avg: '$total' },
        },
      },
    ];

    const result = await this.orderModel.aggregate(pipeline).exec();

    if (result.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantitySold: 0,
        averageOrderValue: 0,
      };
    }

    return {
      totalOrders: result[0].totalOrders,
      totalRevenue: Math.round(result[0].totalRevenue * 100) / 100,
      totalQuantitySold: result[0].totalQuantitySold,
      averageOrderValue: Math.round(result[0].averageOrderValue * 100) / 100,
    };
  }

  private buildSortConditions(sortBy: string): Record<string, 1 | -1> {
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      total_desc: { total: -1 },
      total_asc: { total: 1 },
      date_desc: { createdAt: -1 },
      date_asc: { createdAt: 1 },
      quantity_desc: { totalQuantity: -1 },
      quantity_asc: { totalQuantity: 1 },
      client_name_desc: { clientName: -1 },
      client_name_asc: { clientName: 1 },
    };

    return sortMap[sortBy] || { total: -1 };
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

  private isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['completed'],
      cancelled: [], // No se puede cambiar desde cancelado
      completed: [], // No se puede cambiar desde completado
      returned: ['refunded'],
      refunded: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
