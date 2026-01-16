import userRoutes from './user.route';
import productRoutes from './product.route';
import orderRoutes from './order.route';
import { Router } from 'express';
import { ApiResponse } from '@/lib/api_response/success';

const router = Router();

router.get('/health', (_, res) => {
  ApiResponse.ok(res, 'API is live');
});

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;