import { ProductDataDTO, CreateProductDTO, UpdateProductDTO, PaginatedResponse } from '@/types';

export interface IProductService {
  createProduct(userId: string, data: CreateProductDTO): Promise<ProductDataDTO>;
  getProductById(productId: string): Promise<ProductDataDTO | null>;
  getUserProducts(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<ProductDataDTO>>;
  updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<ProductDataDTO | null>;
  deleteProduct(userId: string, productId: string): Promise<boolean>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}