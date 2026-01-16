import { memo, useCallback } from 'react';
import { Card } from '@components/common/Card/Card';
import { Button } from '@components/common/Button/Button';
import { Formatters } from '@lib/utils/formatters';
import type { OrderDTO } from '@/types';


interface OrderCardProps {
  order: OrderDTO;
  onViewDetails?: (orderId: string) => void;
}

export const OrderCard = memo<OrderCardProps>(({ order, onViewDetails }) => {
  const handleViewDetails = useCallback(() => {
    onViewDetails?.(order.orderId);
  }, [onViewDetails, order.orderId]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderId.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500">
            {Formatters.date(order.createdAt || new Date())}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium">{order.items.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-bold text-primary-600">
            {Formatters.currency(order.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping:</span>
          <span className="text-gray-900">
            {Formatters.truncate(order.shippingAddress, 30)}
          </span>
        </div>
      </div>

      <Button variant="ghost" onClick={handleViewDetails} fullWidth>
        View Details
      </Button>
    </Card>
  );
});

OrderCard.displayName = 'OrderCard';