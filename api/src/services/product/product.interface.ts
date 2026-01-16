import { ProductDTO, CreateProductDTO, UpdateProductDTO, PaginatedResponse } from '@/types';

export interface IProductService {
  createProduct(userId: string, data: CreateProductDTO): Promise<ProductDTO>;
  getProductById(productId: string): Promise<ProductDTO | null>;
  getUserProducts(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<ProductDTO>>;
  updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductDTO
  ): Promise<ProductDTO | null>;
  deleteProduct(userId: string, productId: string): Promise<boolean>;
  decrementStock(productId: string, quantity: number): Promise<boolean>;
}