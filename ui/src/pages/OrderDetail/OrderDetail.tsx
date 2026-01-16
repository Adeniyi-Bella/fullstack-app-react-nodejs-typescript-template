import { memo, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card } from '@components/common/Card/Card';
import { Button } from '@components/common/Button/Button';
import { Loading } from '@components/common/Loading/Loading';
import { Formatters } from '@lib/utils/formatters';
import { useCancelOrder, useOrder, useUpdateOrderStatus } from '@/hooks/api/useOrder';
import { OrderStatus } from '@/types';

export const OrderDetail = memo(() => {
  const { orderId } = useParams({ from: '/_authenticated/orders/$orderId' });
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useOrder(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const handleCancel = useCallback(() => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    cancelOrder(order.orderId, {
      onSuccess: () => {
        navigate({ to: '/orders' });
      },
    });
  }, [order, cancelOrder, navigate]);

  const handleUpdateStatus = useCallback(
    (newStatus: OrderStatus) => {
      if (!order) return;

      updateStatus(
        { orderId: order.orderId, data: { status: newStatus } },
        {
          onSuccess: () => {
            // Order will be refetched automatically
          },
        }
      );
    },
    [order, updateStatus]
  );

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading order..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <p className="text-red-600">Failed to load order</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <a href="/orders" className="hover:text-gray-900">
          Orders
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">#{order.orderId.slice(0, 8)}</span>
      </nav>

      {/* Order Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderId.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {Formatters.date(order.createdAt || new Date(), 'long')}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">Product ID: {item.productId}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {Formatters.currency(item.price)}
                  </p>
                  <p className="text-sm text-gray-600">per item</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>{Formatters.currency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
              <span>Total:</span>
              <span>{Formatters.currency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
          <p className="text-gray-700">{order.shippingAddress}</p>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex gap-3">
            {order.status === OrderStatus.PENDING && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(OrderStatus.PROCESSING)}
                  isLoading={isUpdating}
                >
                  Mark as Processing
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  isLoading={isCancelling}
                >
                  Cancel Order
                </Button>
              </>
            )}
            {order.status === OrderStatus.PROCESSING && (
              <Button
                variant="primary"
                onClick={() => handleUpdateStatus(OrderStatus.SHIPPED)}
                isLoading={isUpdating}
              >
                Mark as Shipped
              </Button>
            )}
            {order.status === OrderStatus.SHIPPED && (
              <Button
                variant="primary"
                onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
                isLoading={isUpdating}
              >
                Mark as Delivered
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});

OrderDetail.displayName = 'OrderDetail';