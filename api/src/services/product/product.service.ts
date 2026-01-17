import { injectable } from 'tsyringe';
import Product, { IProduct } from '@/models/product.model';
import { IProductService } from './product.interface';
import {
  IProductData,
  CreateProductDTO,
  UpdateProductDTO,
  PaginatedResponse,
} from '@/types';
import { logger } from '@/lib/winston';
import {
  AppError,
  DatabaseError,
  NotFoundError,
} from '@/lib/api_response/error';
import { randomUUID } from 'crypto';

@injectable()
export class ProductService implements IProductService {
  private mapToDTO(product: IProduct): IProductData {
    return {
      productId: product.productId,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      status: product.status,
      userId: product.userId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async createProduct(userId: string, data: CreateProductDTO): Promise<IProductData> {
    try {
      const product = await Product.create({
        productId: randomUUID(),
        userId,
        ...data,
      });

      logger.info('Product created', { productId: product.productId, userId });

      return this.mapToDTO(product);
    } catch (error) {
      logger.error('Error creating product', { userId, error });
      if (error instanceof AppError) throw error;
      throw new DatabaseError('Failed to create product');
    }
  }

  async getProductById(productId: string): Promise<IProductData | null> {
    try {
      const product = await Product.findOne({ productId })
        .select('-__v')
        .lean<IProductData>()
        .exec();

      if (!product) return null;

      return this.mapToDTO(product as IProduct);
    } catch (error) {
      logger.error('Error getting product', { productId, error });
      throw new DatabaseError('Failed to retrieve product');
    }
  }

  async getUserProducts(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<IProductData>> {
    try {
      const [products, total] = await Promise.all([
        Product.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .select('-__v')
          .lean<IProductData[]>()
          .exec(),
        Product.countDocuments({ userId }).exec(),
      ]);

      return {
        data: products.map((p) => this.mapToDTO(p as IProduct)),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      logger.error('Error getting user products', { userId, error });
      throw new DatabaseError('Failed to retrieve products');
    }
  }

  async updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<IProductData | null> {
    try {
      const product = await Product.findOneAndUpdate(
        { productId, userId },
        { $set: { ...data, updatedAt: new Date() } },
        { new: true }
      )
        .select('-__v')
        .exec();

      if (!product) {
        throw new NotFoundError();
      }

      logger.info('Product updated', { productId, userId });

      return this.mapToDTO(product);
    } catch (error) {
       if (error instanceof AppError) throw error;
      logger.error('Error updating product', { productId, userId, error });
      throw new DatabaseError('Failed to update product');
    }
  }

  async deleteProduct(userId: string, productId: string): Promise<boolean> {
    try {
      const result = await Product.deleteOne({ productId, userId }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundError();
      }

      logger.info('Product deleted', { productId, userId });
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting product', { productId, userId, error });
      throw new DatabaseError('Failed to delete product');
    }
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const result = await Product.updateOne(
        {
          productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
          $set: { updatedAt: new Date() },
        }
      ).exec();

      if (result.matchedCount === 0) {
        logger.warn('Insufficient stock', { productId, quantity });
        return false;
      }

      logger.debug('Stock decremented', { productId, quantity });
      return true;
    } catch (error) {
      logger.error('Error decrementing stock', { productId, quantity, error });
      throw new DatabaseError('Failed to decrement stock');
    }
  }
}