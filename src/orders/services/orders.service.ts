import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  UpdateOrderDto,
  SearchOrderDto,
  OrderReportsDto,
  OrderReportsResponseDto,
  OrderReportItemDto,
  OrderResponseDto,
} from '../dto';
import { OrdersRepository } from '../repository/orders.repository';
import { Order } from '../schemas/order.schema';
import { HttpResponseUtil, ValidationUtil } from '../../common/utils';
import { CsvUtil } from '../utils';
import { PaginatedData } from '../../common/interfaces';
import { OrderMessages } from '../enums';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const createdOrder = await this.ordersRepository.create(createOrderDto);
    return this.mapToDto(createdOrder);
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = (await this.ordersRepository.findByWhereCondition({ _id: id })) as Order;
    if (!order) {
      throw new NotFoundException(OrderMessages.NOT_FOUND);
    }
    return this.mapToDto(order);
  }

  async findAll(): Promise<PaginatedData<OrderResponseDto>> {
    const orders = (await this.ordersRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as Order[];
    const orderDtos = orders.map(order => this.mapToDto(order));
    return HttpResponseUtil.createListResponse(orderDtos);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const updatedOrder = await this.ordersRepository.updateById(id, updateOrderDto);
    return this.mapToDto(updatedOrder);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.ordersRepository.deleteById(id);
    return {
      message: OrderMessages.DELETED_SUCCESS,
    };
  }

  async search(searchDto: SearchOrderDto): Promise<PaginatedData<OrderResponseDto>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = HttpResponseUtil.buildSearchFilter({
      clientName: searchDto.clientName,
      identifier: searchDto.identifier,
      status: searchDto.status,
      minTotal: searchDto.minTotal,
      maxTotal: searchDto.maxTotal,
    });

    const result = await this.ordersRepository.findByWhereCondition(filter, { page, limit });
    return HttpResponseUtil.processPaginatedResult(result, (order: Order) => this.mapToDto(order));
  }

  async generateReports(
    reportsDto: OrderReportsDto,
  ): Promise<OrderReportsResponseDto | { csvContent: string; headers: Record<string, string> }> {
    // Validar fechas usando la utilidad
    const { startDate, endDate } = ValidationUtil.parseAndValidateDates(
      reportsDto.startDate,
      reportsDto.endDate,
    );

    // Configurar filtros para el repositorio
    const filters = {
      startDate,
      endDate,
      clientId: reportsDto.clientId,
      productId: reportsDto.productId,
      sortBy: reportsDto.sortBy || 'total_desc',
      page: reportsDto.returnCsv ? undefined : reportsDto.page,
      limit: reportsDto.returnCsv ? undefined : reportsDto.limit,
    };

    try {
      // Obtener datos y resumen
      const [{ data, total }, summary] = await Promise.all([
        this.ordersRepository.findOrdersForReports(filters),
        this.ordersRepository.getOrdersSummary({
          startDate,
          endDate,
          clientId: reportsDto.clientId,
          productId: reportsDto.productId,
        }),
      ]);

      // Mapear datos a DTO de reporte
      const reportItems: OrderReportItemDto[] = data.map(order => this.mapToReportDto(order));

      if (reportsDto.returnCsv) {
        // Retornar CSV
        const csvContent = CsvUtil.addUtf8Bom(CsvUtil.convertOrderReportsToCsv(reportItems));
        const headers = CsvUtil.getCsvHeaders('order-reports');

        return { csvContent, headers };
      } else {
        // Retornar JSON con paginación
        const page = reportsDto.page || 1;
        const limit = reportsDto.limit || 10;
        const totalPages = Math.ceil(total / limit);

        return {
          data: reportItems,
          total,
          page,
          limit,
          totalPages,
          filters: {
            startDate: reportsDto.startDate,
            endDate: reportsDto.endDate,
            clientId: reportsDto.clientId,
            productId: reportsDto.productId,
            sortBy: filters.sortBy,
          },
          summary,
        };
      }
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException('Error al generar el reporte: ' + error.message);
    }
  }

  private mapToDto(order: Order): OrderResponseDto {
    return {
      id: order._id.toString(),
      identifier: order.identifier,
      clientId: order.clientId.toString(),
      clientName: order.clientName,
      total: order.total,
      totalQuantity: order.totalQuantity,
      status: order.status,
      products: order.products.map(product => ({
        ...product,
        productId: product.productId.toString(),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapToReportDto(order: Order): OrderReportItemDto {
    return {
      orderId: order._id.toString(),
      identifier: order.identifier,
      clientId: order.clientId.toString(),
      clientName: order.clientName,
      total: order.total,
      totalQuantity: order.totalQuantity,
      status: order.status,
      createdAt: order.createdAt,
      products: order.products.map(product => ({
        productId: product.productId.toString(),
        name: product.name,
        quantity: product.quantity,
        price: product.price,
      })),
    };
  }
}
