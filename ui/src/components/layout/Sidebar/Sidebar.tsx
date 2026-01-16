import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { useUIStore } from '@store/ui.store';
import { Helpers } from '@lib/utils/helpers';
import { HomeIcon } from '@/components/common/Icon/icons/HomeIcon';
import { PackageIcon } from '@/components/common/Icon/icons/PackageIcon';
import { ClipboardIcon } from '@/components/common/Icon/icons/ClipboardIcon';


interface SidebarProps {
  className?: string;
}

export const Sidebar = memo<SidebarProps>(({ className }) => {
  const { isSidebarOpen } = useUIStore();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon
    },
    {
      label: 'Products',
      path: '/products',
      icon: PackageIcon,
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: ClipboardIcon
    },
  ];

  if (!isSidebarOpen) return null;

  return (
    <aside
      className={Helpers.cn(
        'w-64 bg-white border-r border-gray-200',
        className
      )}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              activeProps={{
                className: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
              }}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
