import { useSelector } from 'react-redux';
import { Bell, User } from 'lucide-react';
import { RootState } from '../../store/store';
import { Link } from 'react-router-dom';

{/* <Heart /> */}

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return(
      <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800"></h1>
          </div>
          
          <div className="flex items-center gap-4 z-50">
            <Link
                  to="/register"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
              List space
            </Link>

            <Link
                  to="/login"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                Find space
            </Link>


            <Link
                  to="/contact"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                Contact
            </Link>
            

          </div>
        </div>
      </div>
    </header>
    )
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}