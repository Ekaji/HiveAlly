import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut,
  Boxes,
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
    // { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/user/profile', icon: User },
    { name: 'Listings', href: '/user/listings', icon: Boxes },
    { name: 'Settings', href: '/user/settings', icon: Settings },
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r-4 border-black">
        {/* Brand */}
        <div className="flex items-center justify-center h-20 border-b-4 border-black">
          <Link to="/" className="text-2xl font-extrabold text-black underline decoration-yellow-300">
            HiveAlly
          </Link>
        </div>
  
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
  
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3 border-4 border-black rounded-lg transition-all 
                  ${isActive ? 'bg-yellow-300 text-black' : 'bg-white hover:bg-yellow-200'}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-lg font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
  
        {/* Logout */}
        <div className="px-4 py-4 border-t-4 border-black">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 border-4 border-black bg-white hover:bg-yellow-300 rounded-lg transition-all"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-lg font-bold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
  

  // return (
  //   <div className="hidden lg:flex lg:flex-shrink-0">
  //     <div className="flex flex-col w-64">
  //       <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
  //         <div className="flex items-center flex-shrink-0 px-4">
  //           <Link to="/" className="text-white text-xl font-bold">
  //             HiveAlly
  //           </Link>
  //         </div>
  //         <nav className="mt-8 flex-1 px-2 space-y-1">
  //           {navigation.map((item) => {
  //             const Icon = item.icon;
  //             return (
  //               <Link
  //                 key={item.name}
  //                 to={item.href}
  //                 className={`${
  //                   location.pathname === item.href
  //                     ? 'bg-gray-900 text-white'
  //                     : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  //                 } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
  //               >
  //                 <Icon className="mr-3 h-6 w-6" />
  //                 {item.name}
  //               </Link>
  //             );
  //           })}
  //         </nav>
  //         <div className="mt-auto px-2">
  //           <button
  //             onClick={handleLogout}
  //             className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
  //           >
  //             <LogOut className="mr-3 h-6 w-6" />
  //             Logout
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}