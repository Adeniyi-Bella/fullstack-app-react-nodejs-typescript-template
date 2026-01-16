import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { MainLayout } from '@components/layout/MainLayout/MainLayout';
import { useAuthStore } from '@store/auth.store';
import { Suspense } from 'react';
import { Loading } from '@components/common/Loading/Loading';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <Suspense fallback={<Loading size="lg" />}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
}