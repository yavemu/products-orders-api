import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { RepositoryUtil } from '../../common/utils';
import { OrderMessages } from '../enums';

@Injectable()
export class OrdersRepository {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(orderData: Partial<Order>): Promise<any> {
    const order = new this.orderModel(orderData);
    return order.save();
  }

  async findByWhereCondition(
    whereCondition: Record<string, any> = {},
    options?: {
      page?: number;
      limit?: number;
      select?: string;
      multiple?: boolean;
      sort?: Record<string, any>;
    },
  ): Promise<any> {
    const { sort = { createdAt: -1 }, ...restOptions } = options || {};

    return RepositoryUtil.executeFindByWhereCondition(this.orderModel, whereCondition, {
      ...restOptions,
      sort,
    });
  }

  async updateById(id: string, updateData: Partial<Order>): Promise<any> {
    RepositoryUtil.validateObjectId(id, OrderMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.orderModel, { _id: id }, OrderMessages.NOT_FOUND);

    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string): Promise<any> {
    RepositoryUtil.validateObjectId(id, OrderMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.orderModel, { _id: id }, OrderMessages.NOT_FOUND);

    return this.orderModel.findByIdAndDelete(id).exec();
  }
}
