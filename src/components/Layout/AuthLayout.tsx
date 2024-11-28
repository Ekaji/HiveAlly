import { Link, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { user } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
      <>
    <header className="border-b-4 border-black bg-white">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-black">HiveAlly</h1>
        </div>
        <div className="flex items-center gap-6">
          <button className="h-12 w-12 border-2 border-black bg-yellow-300 flex items-center justify-center hover:bg-black hover:text-yellow-300 transition-colors">
            <Bell className="h-6 w-6 text-black" />
          </button>
          <Link
            to="/user/profile"
            className="flex items-center gap-4 border-2 border-black px-4 py-2 bg-green-300 hover:bg-black hover:text-green-300 transition-colors"
          >
            <div className="h-10 w-10 border-2 border-black bg-white flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
            <span className="text-lg font-semibold text-black">
              {user?.email}
            </span>
          </Link>
        </div>
      </div>
    </header>
    {/* <Outlet /> */}
    </>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}