import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { OrdersService } from '../../services/orders.service';
import { OrdersRepository } from '../../repository/orders.repository';
import { OrderFactory } from '../../../common/testing/factories/order.factory';
import { OrderMessages } from '../../enums';
import { CreateOrderDto, UpdateOrderDto, SearchOrderDto, OrderReportsDto } from '../../dto';
import { HttpResponseUtil, ValidationUtil } from '../../../common/utils';
import { CsvUtil } from '../../utils';

// Mock the utilities
jest.mock('../../../common/utils/http-response.util');
jest.mock('../../../common/utils/validation.util');
jest.mock('../../utils/csv.util');

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: jest.Mocked<OrdersRepository>;

  const mockOrder = OrderFactory.create();
  const mockOrderResponse = OrderFactory.createResponseDto(mockOrder);

  const mockRepository = {
    create: jest.fn(),
    findOneById: jest.fn(),
    findAll: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    search: jest.fn(),
    findOrdersForReports: jest.fn(),
    getOrdersSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get(OrdersRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto: CreateOrderDto = OrderFactory.createDto();
      repository.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);

      expect(repository.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual({
        id: mockOrder._id.toString(),
        identifier: mockOrder.identifier,
        clientId: mockOrder.clientId.toString(),
        clientName: mockOrder.clientName,
        total: mockOrder.total,
        totalQuantity: mockOrder.totalQuantity,
        status: mockOrder.status,
        products: mockOrder.products.map(p => ({
          ...p,
          productId: p.productId.toString(),
        })),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const createOrderDto: CreateOrderDto = OrderFactory.createDto();
      repository.create.mockRejectedValue(new Error('Repository error'));

      await expect(service.create(createOrderDto)).rejects.toThrow('Repository error');
    });
  });

  describe('findOne', () => {
    it('should find an order by ID', async () => {
      const orderId = mockOrder._id.toString();
      repository.findOneById.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId);

      expect(repository.findOneById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({
        id: mockOrder._id.toString(),
        identifier: mockOrder.identifier,
        clientId: mockOrder.clientId.toString(),
        clientName: mockOrder.clientName,
        total: mockOrder.total,
        totalQuantity: mockOrder.totalQuantity,
        status: mockOrder.status,
        products: mockOrder.products.map(p => ({
          ...p,
          productId: p.productId.toString(),
        })),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const orderId = mockOrder._id.toString();
      repository.findOneById.mockRejectedValue(new Error('Order not found'));

      await expect(service.findOne(orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = OrderFactory.createMany(3);
      repository.findAll.mockResolvedValue(mockOrders);

      const mockHttpResponse = {
        data: mockOrders.map(o => OrderFactory.createResponseDto(o)),
        meta: {
          total: mockOrders.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      (HttpResponseUtil.createListResponse as jest.Mock).mockReturnValue(mockHttpResponse);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(HttpResponseUtil.createListResponse).toHaveBeenCalledWith(
        mockOrders.map(o => service['mapToDto'](o))
      );
      expect(result).toEqual(mockHttpResponse);
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const orderId = mockOrder._id.toString();
      const updateDto: UpdateOrderDto = OrderFactory.createUpdateDto();
      const updatedOrder = { ...mockOrder, ...updateDto };
      
      repository.updateById.mockResolvedValue(updatedOrder);

      const result = await service.update(orderId, updateDto);

      expect(repository.updateById).toHaveBeenCalledWith(orderId, updateDto);
      expect(result).toEqual({
        id: updatedOrder._id.toString(),
        identifier: updatedOrder.identifier,
        clientId: updatedOrder.clientId.toString(),
        clientName: updatedOrder.clientName,
        total: updatedOrder.total,
        totalQuantity: updatedOrder.totalQuantity,
        status: updatedOrder.status,
        products: updatedOrder.products.map(p => ({
          ...p,
          productId: p.productId.toString(),
        })),
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const orderId = mockOrder._id.toString();
      const updateDto: UpdateOrderDto = OrderFactory.createUpdateDto();
      repository.updateById.mockRejectedValue(new Error('Update failed'));

      await expect(service.update(orderId, updateDto)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove an order successfully', async () => {
      const orderId = mockOrder._id.toString();
      const deleteResponse = { message: OrderMessages.DELETED_SUCCESS };
      
      repository.deleteById.mockResolvedValue(deleteResponse as any);

      const result = await service.remove(orderId);

      expect(repository.deleteById).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(deleteResponse);
    });

    it('should handle repository errors', async () => {
      const orderId = mockOrder._id.toString();
      repository.deleteById.mockRejectedValue(new Error('Delete failed'));

      await expect(service.remove(orderId)).rejects.toThrow('Delete failed');
    });
  });

  describe('search', () => {
    it('should search orders successfully', async () => {
      const searchDto: SearchOrderDto = OrderFactory.createSearchDto();
      const mockSearchResult = {
        data: OrderFactory.createMany(2),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      
      repository.search.mockResolvedValue(mockSearchResult as any);
      
      const mockProcessedResult = {
        data: mockSearchResult.data.map(o => OrderFactory.createResponseDto(o)),
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      (HttpResponseUtil.processPaginatedResult as jest.Mock).mockReturnValue(mockProcessedResult);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(HttpResponseUtil.processPaginatedResult).toHaveBeenCalled();
      expect(result).toEqual(mockProcessedResult);
    });
  });

  describe('generateReports', () => {
    const mockParsedDates = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    };

    const mockReportData = {
      data: OrderFactory.createMany(2),
      total: 2,
    };

    const mockSummary = {
      totalOrders: 2,
      totalRevenue: 500.00,
      totalQuantity: 10,
      averageOrderValue: 250.00,
    };

    beforeEach(() => {
      (ValidationUtil.parseAndValidateDates as jest.Mock).mockReturnValue(mockParsedDates);
      repository.findOrdersForReports.mockResolvedValue(mockReportData as any);
      repository.getOrdersSummary.mockResolvedValue(mockSummary as any);
    });

    it('should generate JSON report successfully', async () => {
      const reportsDto: OrderReportsDto = OrderFactory.createReportsDto({
        returnCsv: false,
      });

      const result = await service.generateReports(reportsDto);

      expect(ValidationUtil.parseAndValidateDates).toHaveBeenCalledWith(
        reportsDto.startDate,
        reportsDto.endDate
      );
      expect(repository.findOrdersForReports).toHaveBeenCalledWith({
        startDate: mockParsedDates.startDate,
        endDate: mockParsedDates.endDate,
        clientId: reportsDto.clientId,
        productId: reportsDto.productId,
        sortBy: reportsDto.sortBy || 'total_desc',
        page: reportsDto.page,
        limit: reportsDto.limit,
      });
      expect(repository.getOrdersSummary).toHaveBeenCalledWith({
        startDate: mockParsedDates.startDate,
        endDate: mockParsedDates.endDate,
        clientId: reportsDto.clientId,
        productId: reportsDto.productId,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('filters');
    });

    it('should generate CSV report successfully', async () => {
      const reportsDto: OrderReportsDto = OrderFactory.createReportsDto({
        returnCsv: true,
      });

      const mockCsvContent = 'csv,content,here';
      const mockCsvHeaders = {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="order-reports.csv"',
      };

      (CsvUtil.convertOrderReportsToCsv as jest.Mock).mockReturnValue(mockCsvContent);
      (CsvUtil.addUtf8Bom as jest.Mock).mockReturnValue('\ufeff' + mockCsvContent);
      (CsvUtil.getCsvHeaders as jest.Mock).mockReturnValue(mockCsvHeaders);

      const result = await service.generateReports(reportsDto);

      expect(CsvUtil.convertOrderReportsToCsv).toHaveBeenCalled();
      expect(CsvUtil.addUtf8Bom).toHaveBeenCalledWith(mockCsvContent);
      expect(CsvUtil.getCsvHeaders).toHaveBeenCalledWith('order-reports');

      expect(result).toEqual({
        csvContent: '\ufeff' + mockCsvContent,
        headers: mockCsvHeaders,
      });
    });

    it('should handle validation errors', async () => {
      const reportsDto: OrderReportsDto = OrderFactory.createReportsDto();
      (ValidationUtil.parseAndValidateDates as jest.Mock).mockImplementation(() => {
        throw new UnprocessableEntityException('Invalid date range');
      });

      await expect(service.generateReports(reportsDto)).rejects.toThrow(
        new UnprocessableEntityException('Invalid date range')
      );
    });

    it('should handle general errors', async () => {
      const reportsDto: OrderReportsDto = OrderFactory.createReportsDto();
      repository.findOrdersForReports.mockRejectedValue(new Error('Database error'));

      await expect(service.generateReports(reportsDto)).rejects.toThrow(
        new BadRequestException('Error al generar el reporte: Database error')
      );
    });

    it('should use default sortBy when not provided', async () => {
      const reportsDto: OrderReportsDto = {
        ...OrderFactory.createReportsDto(),
        sortBy: undefined,
      };

      await service.generateReports(reportsDto);

      expect(repository.findOrdersForReports).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'total_desc',
        })
      );
    });
  });

  describe('mapToDto', () => {
    it('should map order to DTO correctly', () => {
      const order = OrderFactory.create();
      
      const result = service['mapToDto'](order);

      expect(result).toEqual({
        id: order._id.toString(),
        identifier: order.identifier,
        clientId: order.clientId.toString(),
        clientName: order.clientName,
        total: order.total,
        totalQuantity: order.totalQuantity,
        status: order.status,
        products: order.products.map(p => ({
          ...p,
          productId: p.productId.toString(),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    });

    it('should handle different ObjectId types', () => {
      const order = OrderFactory.create();
      
      const result = service['mapToDto'](order);

      expect(typeof result.id).toBe('string');
      expect(typeof result.clientId).toBe('string');
      expect(result.id).toBe(order._id.toString());
      expect(result.clientId).toBe(order.clientId.toString());
    });
  });

  describe('mapToReportDto', () => {
    it('should map order to report DTO correctly', () => {
      const order = OrderFactory.create();
      
      const result = service['mapToReportDto'](order);

      expect(result).toEqual({
        orderId: order._id.toString(),
        identifier: order.identifier,
        clientId: order.clientId.toString(),
        clientName: order.clientName,
        total: order.total,
        totalQuantity: order.totalQuantity,
        status: order.status,
        createdAt: order.createdAt,
        products: order.products.map(p => ({
          productId: p.productId.toString(),
          name: p.name,
          quantity: p.quantity,
          price: p.price,
        })),
      });
    });
  });

  describe('dependency injection', () => {
    it('should inject OrdersRepository', () => {
      expect(service['ordersRepository']).toBeDefined();
      expect(service['ordersRepository']).toBe(repository);
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      repository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid input gracefully', async () => {
      repository.create.mockRejectedValue(new BadRequestException('Invalid order data'));

      await expect(service.create({} as any)).rejects.toThrow('Invalid order data');
    });
  });
});