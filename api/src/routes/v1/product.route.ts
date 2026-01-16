import { body, param } from 'express-validator';
import {
  createProduct,
  getProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
} from '@/controllers/product/product.controller';
import resetMonthlyLimits from '@/middlewares/resetMonthlyLimits';
import authenticate from '@/middlewares/authenticate';
import validationError from '@/middlewares/validationError';
import { Router } from 'express';

const router = Router();

router.use(authenticate);
router.use(resetMonthlyLimits);

router.post(
  '/',
  body('name').isString().trim().isLength({ min: 3 }),
  body('description').isString().trim().isLength({ min: 10 }),
  body('price').isNumeric().custom((val) => val > 0),
  body('category').isIn(['electronics', 'clothing', 'books', 'home', 'sports']),
  body('stock').isInt({ min: 0 }),
  validationError,
  createProduct
);

router.get('/', getUserProducts);

router.get(
  '/:productId',
  param('productId').isString().notEmpty(),
  validationError,
  getProduct
);

router.patch(
  '/:productId',
  param('productId').isString().notEmpty(),
  validationError,
  updateProduct
);

router.delete(
  '/:productId',
  param('productId').isString().notEmpty(),
  validationError,
  deleteProduct
);

export default router;
