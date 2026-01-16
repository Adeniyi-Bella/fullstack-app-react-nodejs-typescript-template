import { createFileRoute } from '@tanstack/react-router';
import { OrderDetail } from '@pages/OrderDetail/OrderDetail';

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderDetail,
});