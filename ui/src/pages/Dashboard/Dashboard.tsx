import { memo } from 'react';
import { Loading } from '@components/common/Loading/Loading';
import { useUserProfile } from '@hooks/api/useUser';
import { Formatters } from '@lib/utils/formatters';
import { Card } from '@components/common/Card/Card';
import { ProductList } from '@/components/product/ProductList/ProductList';

export const Dashboard = memo(() => {
  const { data: user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600 mt-2">
          Current Plan: <span className="font-semibold capitalize">{user?.plan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Products Limit</p>
            <p className="text-2xl font-bold text-primary-600">
              {user?.limits.products?.current ?? 0} / {user?.limits.products?.max ?? 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Orders Limit</p>
            <p className="text-2xl font-bold text-primary-600">
              {user?.limits.orders?.current ?? 0} / {user?.limits.orders?.max ?? 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">API Calls</p>
            <p className="text-2xl font-bold text-primary-600">
              {Formatters.number(user?.limits.apiCalls?.current ?? 0)} / {Formatters.number(user?.limits.apiCalls?.max ?? 0)}
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Products</h2>
          <ProductList />
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';