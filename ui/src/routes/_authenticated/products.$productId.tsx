import { createFileRoute } from '@tanstack/react-router';
import { ProductDetail } from '@pages/ProductDetail/ProductDetail';

export const Route = createFileRoute('/_authenticated/products/$productId')({
  component: ProductDetail,
});