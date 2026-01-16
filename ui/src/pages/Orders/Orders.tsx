import { memo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { OrderList } from '@components/order/OrderList/OrderList';

export const Orders = memo(() => {
  const navigate = useNavigate();

  const handleOrderClick = useCallback(
    (orderId: string) => {
      navigate({ to: `/orders/${orderId}` });
    },
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">View and manage your orders</p>
      </div>

      {/* Orders List */}
      <OrderList onOrderClick={handleOrderClick} />
    </div>
  );
});

Orders.displayName = 'Orders';