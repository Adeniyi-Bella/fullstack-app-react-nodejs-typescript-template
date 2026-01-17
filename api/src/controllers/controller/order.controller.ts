import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { asyncHandler } from '@/middlewares/errorHandler';
import { IOrderService } from '@/services/order/order.interface';
import { NotFoundError } from '@/lib/api_response/error';
import { IUserService } from '@/services/users/user.interface';
import { ApiResponse } from '@/lib/api_response/success';
import { CreateOrderDTO, OrderParams, UpdateStatusDTO } from '@/types';


export const createOrder = asyncHandler(
  async (req: Request<unknown, unknown, CreateOrderDTO>, res: Response): Promise<void> => {
    const orderService = container.resolve<IOrderService>('IOrderService');
    const userService = container.resolve<IUserService>('IUserService');

    await userService.decrementLimit(req.userId, 'orders');

    const order = await orderService.createOrder(req.userId, req.body);

    ApiResponse.created(res, 'Order created successfully', { order });
  }
);

export const getOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderService = container.resolve<IOrderService>('IOrderService');
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Verify user owns the order
    if (order.userId !== req.userId) {
      throw new NotFoundError('Order not found');
    }

    ApiResponse.ok(res, 'Order retrieved', { order });
  }
);

export const getUserOrders = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderService = container.resolve<IOrderService>('IOrderService');

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await orderService.getUserOrders(req.userId, limit, offset);

    ApiResponse.ok(res, 'Orders retrieved', result);
  }
);

export const updateOrderStatus = asyncHandler(
  async (
    req: Request<OrderParams, unknown, UpdateStatusDTO>, 
    res: Response
  ): Promise<void> => {
    const orderService = container.resolve<IOrderService>('IOrderService');
    
    const { orderId } = req.params; 
    
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    ApiResponse.ok(res, 'Order status updated', { order });
  }
);

export const cancelOrder = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const orderService = container.resolve<IOrderService>('IOrderService');
    const { orderId } = req.params;

    await orderService.cancelOrder(req.userId, orderId);

    ApiResponse.ok(res, 'Order cancelled successfully');
  }
);
