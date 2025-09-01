import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { ProductsService } from '../products/products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockOrder = {
  _id: 'orderId',
  identifier: 'ORD-20230101-ABC',
  clientName: 'Test Client',
  total: 100,
  products: [
    {
      productId: new Types.ObjectId(),
      quantity: 1,
      price: 100,
      name: 'Test Product',
    },
  ],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  toObject: function() { return this; },
};

const mockOrderModel = {
  findById: jest.fn(),
  aggregate: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockProductsService = {
  findManyByIds: jest.fn(),
};

// Mock the chainable exec method
mockOrderModel.findById.mockReturnValue({
  exec: jest.fn().mockResolvedValue(mockOrder),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: Model<OrderDocument>;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get<Model<OrderDocument>>(getModelToken(Order.name));
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find and return an order by ID', async () => {
      const id = 'orderId';
      const result = await service.findOne(id);

      expect(orderModel.findById).toHaveBeenCalledWith(id);
      expect(result.id).toEqual(mockOrder._id);
      expect(result.clientName).toEqual(mockOrder.clientName);
    });

    it('should throw NotFoundException if order is not found', async () => {
      mockOrderModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonExistentId')).rejects.toThrow('Pedido no encontrado');
    });
  });

  describe('getLastMonthTotal', () => {
    it('should return the total sold in the last month', async () => {
      const aggregateResult = [{ totalSold: 5000 }];
      mockOrderModel.aggregate.mockResolvedValue(aggregateResult);

      const result = await service.getLastMonthTotal();

      expect(orderModel.aggregate).toHaveBeenCalled();
      expect(result).toBe(5000);
    });

    it('should return 0 if there are no sales in the last month', async () => {
      mockOrderModel.aggregate.mockResolvedValue([]);
      const result = await service.getLastMonthTotal();
      expect(result).toBe(0);
    });
  });

  describe('getHighestOrder', () => {
    it('should return the order with the highest total', async () => {
      mockOrderModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.getHighestOrder();

      expect(orderModel.findOne).toHaveBeenCalled();
      expect(result.id).toBe(mockOrder._id);
    });

    it('should throw NotFoundException if no orders exist', async () => {
      mockOrderModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getHighestOrder()).rejects.toThrow(NotFoundException);
      await expect(service.getHighestOrder()).rejects.toThrow('No se encontraron pedidos');
    });
  });

  describe('create', () => {
    it('should create and return an order', async () => {
      const productId = new Types.ObjectId().toHexString();
      const createDto = {
        clientName: 'New Client',
        products: [{ productId, quantity: 2 }],
      };
      const mockProduct = { id: productId, name: 'Test Product', price: 50, sku: 's', picture: 'p' };

      mockProductsService.findManyByIds.mockResolvedValue([mockProduct]);

      const createdOrderData = {
        ...mockOrder,
        clientName: 'New Client',
        toObject: () => ({ ...mockOrder, clientName: 'New Client' })
      };
      mockOrderModel.create.mockResolvedValue(createdOrderData as any);

      const result = await service.create(createDto);

      expect(productsService.findManyByIds).toHaveBeenCalledWith([productId]);
      expect(orderModel.create).toHaveBeenCalled();
      expect(result.clientName).toEqual(createDto.clientName);
      expect(result.id).toBeDefined();
    });

    it('should throw NotFoundException if products are not found during creation', async () => {
      const createDto = {
        clientName: 'Test Client',
        products: [{ productId: 'nonExistentId', quantity: 1 }],
      };
      mockProductsService.findManyByIds.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Productos no encontrados: nonExistentId');
      expect(productsService.findManyByIds).toHaveBeenCalledWith(['nonExistentId']);
    });
  });

  describe('update', () => {
    it('should update and return the order', async () => {
      const updateDto = { clientName: 'Updated Client' };
      const orderId = 'orderId';

      const mockUpdatedOrder = {
        ...mockOrder,
        clientName: 'Updated Client',
        save: jest.fn().mockResolvedValue({
          ...mockOrder,
          clientName: 'Updated Client',
          toObject: () => ({ ...mockOrder, clientName: 'Updated Client' })
        }),
        toObject: () => ({ ...mockOrder, clientName: 'Updated Client' })
      };

      mockOrderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedOrder),
      } as any);

      const result = await service.update(orderId, updateDto);

      expect(orderModel.findById).toHaveBeenCalledWith(orderId);
      expect(mockUpdatedOrder.save).toHaveBeenCalled();
      expect(result.clientName).toEqual('Updated Client');
    });

    it('should throw NotFoundException if order to update is not found', async () => {
      mockOrderModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonExistentId', {})).rejects.toThrow(NotFoundException);
    });
  });
});
