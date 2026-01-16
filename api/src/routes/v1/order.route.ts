import { Router } from 'express';
import { body, param } from 'express-validator';
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validationError';
import resetMonthlyLimits from '@/middlewares/resetMonthlyLimits';
import { cancelOrder, createOrder, getOrder, getUserOrders, updateOrderStatus } from '@/controllers/controller/order.controller';

const router = Router();

router.use(authenticate);
router.use(resetMonthlyLimits);

router.post(
  '/',
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productId')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Shipping address must be at least 10 characters'),
  validationError,
  createOrder
);

router.get('/', getUserOrders);

router.get(
  '/:orderId',
  param('orderId').isString().notEmpty(),
  validationError,
  getOrder
);

router.patch(
  '/:orderId/status',
  param('orderId').isString().notEmpty(),
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  validationError,
  updateOrderStatus
);

router.post(
  '/:orderId/cancel',
  param('orderId').isString().notEmpty(),
  validationError,
  cancelOrder
);

export default router;