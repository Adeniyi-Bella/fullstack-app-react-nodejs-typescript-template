import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/errorHandler';
import { IProductService } from '@/services/product/product.interface';
import { IUserService } from '@/services/users/user.interface';
import { ApiResponse } from '@/lib/api_response/success';
import { NotFoundError } from '@/lib/api_response/error';

export const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productService =
      container.resolve<IProductService>('IProductService');
    const userService = container.resolve<IUserService>('IUserService');

    await userService.decrementLimit(req.userId, 'products');

    const product = await productService.createProduct(req.userId, req.body);

    ApiResponse.created(res, 'Product created successfully', { product });
  },
);

export const getProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productService =
      container.resolve<IProductService>('IProductService');
    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    ApiResponse.ok(res, 'Product retrieved', { product });
  },
);

export const getUserProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productService =
      container.resolve<IProductService>('IProductService');

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await productService.getUserProducts(
      req.userId,
      limit,
      offset,
    );

    ApiResponse.ok(res, 'Products retrieved', result);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productService =
      container.resolve<IProductService>('IProductService');
    const { productId } = req.params;

    const product = await productService.updateProduct(
      req.userId,
      productId,
      req.body,
    );

    ApiResponse.ok(res, 'Product updated successfully', { product });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productService =
      container.resolve<IProductService>('IProductService');
    const { productId } = req.params;

    await productService.deleteProduct(req.userId, productId);

    ApiResponse.noContent(res);
  },
);
