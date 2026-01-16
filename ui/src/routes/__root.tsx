import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Suspense } from 'react';
import { Loading } from '@components/common/Loading/Loading';
import { NotFound } from '@/pages/NotFound/NotFound';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound
});

function RootComponent() {
  return (
    <>
      <Suspense fallback={<Loading size="lg" />}>
        <Outlet />
      </Suspense>
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  );
}