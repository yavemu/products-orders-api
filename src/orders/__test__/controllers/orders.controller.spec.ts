import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { OrdersController } from '../../controllers/orders.controller';
import { OrdersService } from '../../services/orders.service';
import { OrderFactory } from '../../../common/testing/factories/order.factory';
import { CreateOrderDto, UpdateOrderDto, SearchOrderDto, OrderReportsDto } from '../../dto';
import { OrderMessages } from '../../enums';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;
  let mockResponse: Partial<Response>;

  const mockOrder = OrderFactory.create();
  const mockOrderResponse = OrderFactory.createResponseDto(mockOrder);

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    generateReports: jest.fn(),
  };

  beforeEach(async () => {
    mockResponse = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = OrderFactory.createDto();

    it('should create an order successfully', async () => {
      service.create.mockResolvedValue(mockOrderResponse as any);

      const result = await controller.create(createOrderDto);

      expect(service.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrderResponse);
    });

    it('should handle service errors', async () => {
      service.create.mockRejectedValue(new BadRequestException('Invalid order data'));

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        new BadRequestException('Invalid order data')
      );
    });

    it('should pass DTO correctly to service', async () => {
      service.create.mockResolvedValue(mockOrderResponse as any);

      await controller.create(createOrderDto);

      expect(service.create).toHaveBeenCalledWith(createOrderDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = OrderFactory.createMany(3).map(o => OrderFactory.createResponseDto(o));
      const mockResponse = {
        data: mockOrders,
        meta: {
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(3);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('search', () => {
    const searchDto: SearchOrderDto = OrderFactory.createSearchDto();

    it('should search orders successfully', async () => {
      const mockSearchResult = {
        data: OrderFactory.createMany(2).map(o => OrderFactory.createResponseDto(o)),
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      service.search.mockResolvedValue(mockSearchResult as any);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResult);
      expect(result.data).toHaveLength(2);
    });

    it('should handle service errors', async () => {
      service.search.mockRejectedValue(new Error('Search failed'));

      await expect(controller.search(searchDto)).rejects.toThrow('Search failed');
    });

    it('should pass search parameters correctly', async () => {
      const customSearchDto: SearchOrderDto = {
        clientName: 'Test Client',
        identifier: 'ORD-2024-ABC123',
        status: 'pending',
        minTotal: 100,
        maxTotal: 500,
        page: 2,
        limit: 5,
      };

      service.search.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, limit: 5, totalPages: 0 }
      } as any);

      await controller.search(customSearchDto);

      expect(service.search).toHaveBeenCalledWith(customSearchDto);
    });
  });

  describe('findOne', () => {
    const orderId = mockOrder._id.toString();

    it('should find an order by ID', async () => {
      service.findOne.mockResolvedValue(mockOrderResponse as any);

      const result = await controller.findOne(orderId);

      expect(service.findOne).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrderResponse);
    });

    it('should handle not found errors', async () => {
      service.findOne.mockRejectedValue(new NotFoundException(OrderMessages.NOT_FOUND));

      await expect(controller.findOne(orderId)).rejects.toThrow(
        new NotFoundException(OrderMessages.NOT_FOUND)
      );
    });

    it('should handle invalid ID errors', async () => {
      const invalidId = 'invalid-id';
      service.findOne.mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        new BadRequestException('Invalid ID')
      );
    });
  });

  describe('update', () => {
    const orderId = mockOrder._id.toString();
    const updateOrderDto: UpdateOrderDto = OrderFactory.createUpdateDto();

    it('should update an order successfully', async () => {
      const updatedOrderResponse = { ...mockOrderResponse, ...updateOrderDto };
      service.update.mockResolvedValue(updatedOrderResponse as any);

      const result = await controller.update(orderId, updateOrderDto);

      expect(service.update).toHaveBeenCalledWith(orderId, updateOrderDto);
      expect(result).toEqual(updatedOrderResponse);
    });

    it('should handle not found errors', async () => {
      service.update.mockRejectedValue(new NotFoundException(OrderMessages.NOT_FOUND));

      await expect(controller.update(orderId, updateOrderDto)).rejects.toThrow(
        new NotFoundException(OrderMessages.NOT_FOUND)
      );
    });

    it('should handle validation errors', async () => {
      service.update.mockRejectedValue(new BadRequestException('Invalid update data'));

      await expect(controller.update(orderId, updateOrderDto)).rejects.toThrow(
        new BadRequestException('Invalid update data')
      );
    });
  });

  describe('remove', () => {
    const orderId = mockOrder._id.toString();

    it('should remove an order successfully', async () => {
      const deleteResponse = { message: OrderMessages.DELETED_SUCCESS };
      service.remove.mockResolvedValue(deleteResponse as any);

      const result = await controller.remove(orderId);

      expect(service.remove).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(deleteResponse);
    });

    it('should handle not found errors', async () => {
      service.remove.mockRejectedValue(new NotFoundException(OrderMessages.NOT_FOUND));

      await expect(controller.remove(orderId)).rejects.toThrow(
        new NotFoundException(OrderMessages.NOT_FOUND)
      );
    });

    it('should handle invalid ID errors', async () => {
      const invalidId = 'invalid-id';
      service.remove.mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.remove(invalidId)).rejects.toThrow(
        new BadRequestException('Invalid ID')
      );
    });
  });

  describe('generateReports', () => {
    const reportsDto: OrderReportsDto = OrderFactory.createReportsDto();

    it('should generate JSON report successfully', async () => {
      const mockReportResponse = {
        data: OrderFactory.createMany(2),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        summary: {
          totalOrders: 2,
          totalRevenue: 500.00,
        },
      };

      service.generateReports.mockResolvedValue(mockReportResponse as any);

      await controller.generateReports(reportsDto, mockResponse as Response);

      expect(service.generateReports).toHaveBeenCalledWith(reportsDto);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockReportResponse,
        statusCode: 200,
      });
    });

    it('should generate CSV report successfully', async () => {
      const mockCsvResponse = {
        csvContent: '\ufefforder,data,here',
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="order-reports.csv"',
        },
      };

      service.generateReports.mockResolvedValue(mockCsvResponse as any);

      await controller.generateReports(
        { ...reportsDto, returnCsv: true },
        mockResponse as Response
      );

      expect(service.generateReports).toHaveBeenCalledWith({ ...reportsDto, returnCsv: true });
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="order-reports.csv"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockCsvResponse.csvContent);
    });

    it('should handle service errors', async () => {
      service.generateReports.mockRejectedValue(new BadRequestException('Report generation failed'));

      await expect(
        controller.generateReports(reportsDto, mockResponse as Response)
      ).rejects.toThrow(new BadRequestException('Report generation failed'));
    });

    it('should set multiple CSV headers correctly', async () => {
      const mockCsvResponse = {
        csvContent: 'csv,content',
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="reports.csv"',
          'Content-Encoding': 'utf-8',
        },
      };

      service.generateReports.mockResolvedValue(mockCsvResponse as any);

      await controller.generateReports(
        { ...reportsDto, returnCsv: true },
        mockResponse as Response
      );

      expect(mockResponse.setHeader).toHaveBeenCalledTimes(3);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="reports.csv"');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Encoding', 'utf-8');
    });
  });

  describe('dependency injection', () => {
    it('should inject OrdersService', () => {
      expect(controller['ordersService']).toBeDefined();
      expect(controller['ordersService']).toBe(service);
    });
  });

  describe('controller methods', () => {
    it('should have all required methods', () => {
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.search).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
      expect(controller.generateReports).toBeDefined();
    });

    it('should have correct method signatures', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.search).toBe('function');
      expect(typeof controller.findOne).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
      expect(typeof controller.generateReports).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service failure');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service failure');
    });

    it('should handle multiple types of errors', async () => {
      const badRequestError = new BadRequestException('Bad request');
      const notFoundError = new NotFoundException('Not found');
      const genericError = new Error('Generic error');

      service.findOne.mockRejectedValue(badRequestError);
      await expect(controller.findOne('invalid')).rejects.toThrow(badRequestError);

      service.findOne.mockRejectedValue(notFoundError);
      await expect(controller.findOne('notfound')).rejects.toThrow(notFoundError);

      service.findOne.mockRejectedValue(genericError);
      await expect(controller.findOne('error')).rejects.toThrow(genericError);
    });
  });

  describe('reports response handling', () => {
    it('should detect CSV response correctly', async () => {
      const csvResponse = {
        csvContent: 'data',
        headers: { 'Content-Type': 'text/csv' },
      };

      service.generateReports.mockResolvedValue(csvResponse as any);

      await controller.generateReports(
        OrderFactory.createReportsDto(),
        mockResponse as Response
      );

      expect('csvContent' in csvResponse).toBe(true);
      expect('headers' in csvResponse).toBe(true);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should detect JSON response correctly', async () => {
      const jsonResponse = {
        data: [],
        total: 0,
        summary: {},
      };

      service.generateReports.mockResolvedValue(jsonResponse as any);

      await controller.generateReports(
        OrderFactory.createReportsDto(),
        mockResponse as Response
      );

      expect('csvContent' in jsonResponse).toBe(false);
      expect('headers' in jsonResponse).toBe(false);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
});