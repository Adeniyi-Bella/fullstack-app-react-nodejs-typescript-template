import { memo } from 'react';
import { OrderCard } from '../OrderCard/OrderCard';
import { Loading } from '@components/common/Loading/Loading';
import { usePagination } from '@hooks/usePagination';
import { Button } from '@components/common/Button/Button';
import { useOrders } from '@/hooks/api/useOrder';

interface OrderListProps {
  onOrderClick?: (orderId: string) => void;
}

export const OrderList = memo<OrderListProps>(({ onOrderClick }) => {
  const { currentPage, goToNextPage, goToPreviousPage, hasNextPage, hasPreviousPage } =
    usePagination({ totalItems: 100, itemsPerPage: 20 });

  const { data, isLoading, error } = useOrders({
    limit: 20,
    offset: (currentPage - 1) * 20,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load orders</p>
      </div>
    );
  }

  const orders = data?.data ?? [];

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <OrderCard key={order.orderId} order={order} onViewDetails={onOrderClick} />
        ))}
      </div>

      {/* Pagination */}
      {data && data.pagination.total > 20 && (
        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <Button variant="secondary" onClick={goToNextPage} disabled={!hasNextPage}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
});

OrderList.displayName = 'OrderList';