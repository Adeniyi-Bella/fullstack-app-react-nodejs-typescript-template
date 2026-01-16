import 'reflect-metadata';
import { container } from 'tsyringe';
import { IUserService } from '@/services/users/user.interface';
import { IProductService } from '@/services/product/product.interface';
import { IOrderService } from '@/services/order/order.interface';
import { UserService } from '@/services/users/user.service';
import { ProductService } from '@/services/product/product.service';
import { OrderService } from '@/services/order/order.service';

// Register services
container.register<IUserService>('IUserService', {
  useClass: UserService,
});

container.register<IProductService>('IProductService', {
  useClass: ProductService,
});

container.register<IOrderService>('IOrderService', {
  useClass: OrderService,
});

export { container };