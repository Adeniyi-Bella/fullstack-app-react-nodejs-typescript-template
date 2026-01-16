import { memo, useEffect } from 'react';
import { ProductCard } from '../ProductCard/ProductCard';
import { Loading } from '@components/common/Loading/Loading';
import { useInfiniteProducts } from '@hooks/api/useProducts';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';

interface ProductListProps {
  onProductClick?: (productId: string) => void;
}

export const ProductList = memo<ProductListProps>(({ onProductClick }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteProducts();

  const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load products</p>
      </div>
    );
  }

  const products = data?.pages.flatMap((page) => page.data) ?? [];

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            onViewDetails={onProductClick}
          />
        ))}
      </div>

      {/* Intersection Observer Sentinel */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loading size="md" />
          </div>
        )}
      </div>
    </div>
  );
});

ProductList.displayName = 'ProductList';