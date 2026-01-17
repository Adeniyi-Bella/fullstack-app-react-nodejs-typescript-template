import { IProductData, CreateProductDTO, UpdateProductDTO, PaginatedResponse } from '@/types';

export interface IProductService {
  createProduct(userId: string, data: CreateProductDTO): Promise<IProductData>;
  getProductById(productId: string): Promise<IProductData | null>;
  getUserProducts(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<IProductData>>;
  updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<IProductData | null>;
  deleteProduct(userId: string, productId: string): Promise<boolean>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}