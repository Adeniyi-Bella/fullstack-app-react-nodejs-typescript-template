import { memo, useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@components/common/Button/Button';
import { ProductList } from '@components/product/ProductList/ProductList';
import { Card } from '@components/common/Card/Card';

export const Products = memo(() => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleProductClick = useCallback(
    (productId: string) => {
      navigate({ to: `/products/${productId}` });
    },
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
          <p className="text-gray-600">Product creation form would go here...</p>
        </Card>
      )}

      {/* Products List */}
      <ProductList onProductClick={handleProductClick} />
    </div>
  );
});

Products.displayName = 'Products';