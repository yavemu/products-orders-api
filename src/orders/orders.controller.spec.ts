import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

const mockOrdersService = {
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  getLastMonthTotal: jest.fn(),
  getHighestOrder: jest.fn(),
};

const mockOrder: OrderResponseDto = {
  id: 'orderId',
  identifier: 'ORD-2024-001',
  clientName: 'Test Client',
  total: 100,
  status: 'pending',
  products: [
    {
      productId: 'productId',
      quantity: 1,
      price: 100,
      name: 'Test Product',
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .useValue({ intercept: jest.fn((context, next) => next.handle()) })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createDto: CreateOrderDto = {
        clientName: 'Test Client',
        products: [
          {
            productId: 'productId',
            quantity: 1,
          },
        ],
      };

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findOne', () => {
    it('should return an order by ID', async () => {
      const id = 'orderId';
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const id = 'orderId';
      const updateDto: UpdateOrderDto = {
        status: 'processing',
      };

      const updatedOrder = { ...mockOrder, status: 'processing' };
      mockOrdersService.update.mockResolvedValue(updatedOrder);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('getLastMonthTotal', () => {
    it('should return last month total sales', async () => {
      const total = 5000;
      mockOrdersService.getLastMonthTotal.mockResolvedValue(total);

      const result = await controller.getLastMonthTotal();

      expect(service.getLastMonthTotal).toHaveBeenCalled();
      expect(result).toEqual({ total });
    });
  });

  describe('getHighestOrder', () => {
    it('should return the highest value order', async () => {
      const highestOrder = { ...mockOrder, total: 10000 };
      mockOrdersService.getHighestOrder.mockResolvedValue(highestOrder);

      const result = await controller.getHighestOrder();

      expect(service.getHighestOrder).toHaveBeenCalled();
      expect(result).toEqual(highestOrder);
    });
  });
});
