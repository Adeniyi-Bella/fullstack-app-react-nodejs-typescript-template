import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@components/common/Button/Button';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useLogout } from '@hooks/api/useAuth';
import { ShoppingCartIcon } from '@/components/common/Icon/icons/ShoppingCartIcon';

export const Header = memo(() => {
  const user = useAuthStore((state) => state.user);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Enterprise</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Orders
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.plan} Plan</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';