import { memo, type ReactNode } from 'react';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';
import { useUIStore } from '@store/ui.store';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = memo<MainLayoutProps>(({ children }) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {isSidebarOpen && <Sidebar />}
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';