import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    { name: 'Total Users', value: '1,234', icon: Users, change: '+12%', changeType: 'increase' },
    { name: 'Total Orders', value: '456', icon: ShoppingCart, change: '+8%', changeType: 'increase' },
    { name: 'Revenue', value: '$12,345', icon: DollarSign, change: '+23%', changeType: 'increase' },
    { name: 'Growth', value: '25%', icon: TrendingUp, change: '+4%', changeType: 'increase' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.email}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your business today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-indigo-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  {item.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
}