import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  Boxes
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clearUser } from '../../store/slices/authSlice';

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(clearUser());
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: Users },
    { name: 'Products', href: '/dashboard/products', icon: Boxes },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link to="/" className="text-white text-xl font-bold">
              Company Name
            </Link>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-2">
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}