import { createFileRoute } from '@tanstack/react-router';
import { Products } from '@pages/Products/Products';

export const Route = createFileRoute('/_authenticated/products')({
  component: Products,
});