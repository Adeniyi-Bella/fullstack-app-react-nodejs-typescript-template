import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProductService } from '@/services/product/product.service';
import Product from '@/models/product.model';
import { ProductCategory, ProductStatus } from '@/types';
import { NotFoundError, DatabaseError } from '@/lib/api_response/error';

vi.mock('@/models/product.model');
vi.mock('@/lib/winston', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const userId = 'user-123';
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: ProductCategory.ELECTRONICS,
        stock: 10,
      };

      const mockCreatedProduct = {
        productId: 'product-123',
        userId,
        ...productData,
        status: ProductStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Product.create).mockResolvedValue(mockCreatedProduct as any);

      const result = await productService.createProduct(userId, productData);

      expect(result.name).toBe(productData.name);
      expect(result.userId).toBe(userId);
      expect(result.price).toBe(productData.price);
      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          name: productData.name,
          price: productData.price,
        })
      );
    });

    it('should throw DatabaseError when creation fails', async () => {
      const userId = 'user-123';
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: ProductCategory.ELECTRONICS,
        stock: 10,
      };

      vi.mocked(Product.create).mockRejectedValue(new Error('DB Error'));

      await expect(
        productService.createProduct(userId, productData)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        productId: 'product-123',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: ProductCategory.ELECTRONICS,
        stock: 10,
        status: ProductStatus.ACTIVE,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Product.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockProduct),
          }),
        }),
      } as any);

      const result = await productService.getProductById('product-123');

      expect(result).toMatchObject({
        productId: 'product-123',
        name: 'Test Product',
      });
      expect(Product.findOne).toHaveBeenCalledWith({ productId: 'product-123' });
    });

    it('should return null when product not found', async () => {
      vi.mocked(Product.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
          }),
        }),
      } as any);

      const result = await productService.getProductById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserProducts', () => {
    it('should return paginated products', async () => {
      const userId = 'user-123';
      const mockProducts = [
        {
          productId: 'product-1',
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          category: ProductCategory.ELECTRONICS,
          stock: 10,
          status: ProductStatus.ACTIVE,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          productId: 'product-2',
          name: 'Product 2',
          description: 'Description 2',
          price: 149.99,
          category: ProductCategory.ELECTRONICS,
          stock: 5,
          status: ProductStatus.ACTIVE,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(Product.find).mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                lean: vi.fn().mockReturnValue({
                  exec: vi.fn().mockResolvedValue(mockProducts),
                }),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(Product.countDocuments).mockReturnValue({
        exec: vi.fn().mockResolvedValue(2),
      } as any);

      const result = await productService.getUserProducts(userId, 10, 0);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const userId = 'user-123';
      const productId = 'product-123';
      const updateData = {
        price: 89.99,
        stock: 15,
      };

      const mockUpdatedProduct = {
        productId,
        userId,
        name: 'Test Product',
        description: 'Test Description',
        price: 89.99,
        category: ProductCategory.ELECTRONICS,
        stock: 15,
        status: ProductStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Product.findOneAndUpdate).mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockUpdatedProduct),
        }),
      } as any);

      const result = await productService.updateProduct(
        userId,
        productId,
        updateData
      );

      expect(result?.price).toBe(89.99);
      expect(result?.stock).toBe(15);
    });

    it('should throw NotFoundError when product not found', async () => {
      const userId = 'user-123';
      const productId = 'nonexistent';
      const updateData = { price: 89.99 };

      vi.mocked(Product.findOneAndUpdate).mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as any);

      await expect(
        productService.updateProduct(userId, productId, updateData)
      ).rejects.toThrow(new NotFoundError);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const userId = 'user-123';
      const productId = 'product-123';

      vi.mocked(Product.deleteOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      } as any);

      const result = await productService.deleteProduct(userId, productId);

      expect(result).toBe(true);
      expect(Product.deleteOne).toHaveBeenCalledWith({ productId, userId });
    });

    it('should throw NotFoundError when product not found', async () => {
      const userId = 'user-123';
      const productId = 'nonexistent';

      vi.mocked(Product.deleteOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      } as any);

      await expect(
        productService.deleteProduct(userId, productId)
      ).rejects.toThrow(new NotFoundError);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock successfully', async () => {
      const productId = 'product-123';
      const quantity = 5;

      vi.mocked(Product.updateOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      } as any);

      const result = await productService.decrementStock(productId, quantity);

      expect(result).toBe(true);
      expect(Product.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          productId,
          stock: { $gte: quantity },
        }),
        expect.any(Object)
      );
    });

    it('should return false when insufficient stock', async () => {
      const productId = 'product-123';
      const quantity = 100;

      vi.mocked(Product.updateOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
      } as any);

      const result = await productService.decrementStock(productId, quantity);

      expect(result).toBe(false);
    });
  });
});