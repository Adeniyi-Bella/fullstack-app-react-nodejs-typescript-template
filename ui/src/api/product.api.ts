import type { ApiSuccessResponse, CreateProductRequest, PaginatedResponse, PaginationParams, ProductDTO, UpdateProductRequest } from "@/types";
import { apiClient } from "./client";


export class ProductApi {
  static async getProducts(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<ProductDTO>> {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedResponse<ProductDTO>>
    >('/products', { params });
    return response.data.data!;
  }

  static async getProduct(productId: string): Promise<ProductDTO> {
    const response = await apiClient.get<ApiSuccessResponse<{ product: ProductDTO }>>(
      `/products/${productId}`
    );
    return response.data.data!.product;
  }

  static async createProduct(data: CreateProductRequest): Promise<ProductDTO> {
    const response = await apiClient.post<ApiSuccessResponse<{ product: ProductDTO }>>(
      '/products',
      data
    );
    return response.data.data!.product;
  }

  static async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<ProductDTO> {
    const response = await apiClient.patch<ApiSuccessResponse<{ product: ProductDTO }>>(
      `/products/${productId}`,
      data
    );
    return response.data.data!.product;
  }

  static async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/products/${productId}`);
  }
}
