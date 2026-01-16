import { memo, useCallback } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card } from '@components/common/Card/Card';
import { Button } from '@components/common/Button/Button';
import { Loading } from '@components/common/Loading/Loading';
import { useProduct, useDeleteProduct } from '@hooks/api/useProducts';
import { useCartStore } from '@store/cart.store';
import { Formatters } from '@lib/utils/formatters';

export const ProductDetail = memo(() => {
  const { productId } = useParams({ from: '/_authenticated/products/$productId' });
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const { data: product, isLoading, error } = useProduct(productId);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    addItem({
      productId: product.productId,
      name: product.name,
      quantity: 1,
      price: product.price,
    });
  }, [product, addItem]);

  const handleDelete = useCallback(() => {
    if (!product) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    deleteProduct(product.productId, {
      onSuccess: () => {
        navigate({ to: '/products' });
      },
    });
  }, [product, deleteProduct, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card>
        <p className="text-red-600">Failed to load product</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <a href="/products" className="hover:text-gray-900">
          Products
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={`https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {product.category}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-600">
                {Formatters.currency(product.price)}
              </span>
            </div>

            <div className="py-4 border-y border-gray-200">
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium capitalize ${
                    product.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className="font-medium">{product.stock} units</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                fullWidth
              >
                Add to Cart
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ProductDetail.displayName = 'ProductDetail';