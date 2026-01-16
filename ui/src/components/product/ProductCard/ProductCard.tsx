import { memo, useCallback } from 'react';
import { Card } from '@components/common/Card/Card';
import { Button } from '@components/common/Button/Button';
import { Formatters } from '@lib/utils/formatters';
import { useCartStore } from '@store/cart.store';
import type { ProductDTO } from '@/types';


interface ProductCardProps {
  product: ProductDTO;
  onViewDetails?: (productId: string) => void;
}

export const ProductCard = memo<ProductCardProps>(({ product, onViewDetails }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = useCallback(() => {
    addItem({
      productId: product.productId,
      name: product.name,
      quantity: 1,
      price: product.price,
    });
  }, [addItem, product]);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(product.productId);
  }, [onViewDetails, product.productId]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-w-1 aspect-h-1 mb-4 bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={`https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          loading="lazy"
          className="object-cover w-full h-full"
        />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {product.name}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {product.description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl font-bold text-primary-600">
          {Formatters.currency(product.price)}
        </span>
        <span className="text-sm text-gray-500">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          fullWidth
        >
          Add to Cart
        </Button>
        <Button variant="ghost" onClick={handleViewDetails}>
          View
        </Button>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
