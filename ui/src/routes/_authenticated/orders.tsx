import { createFileRoute } from '@tanstack/react-router';
import { Orders } from '@pages/Orders/Orders';

export const Route = createFileRoute('/_authenticated/orders')({
  component: Orders,
});