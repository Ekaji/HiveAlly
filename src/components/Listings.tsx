import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { RootState } from '../store/store';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  featured_image: any;
  created_at: string;
}

export default function MyListings({ onOpen, isOpen} :any ){
  const { user } = useSelector((state: RootState) => state.auth);
  const [listings, setListings] = useState<Listing[]>([]);
//   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error: any) {
        toast.error(error.message);
      } 
    //   finally {
    //     setLoading(false);
    //   }
    };

    if (user?.id) {
      fetchListings();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings(listings.filter(listing => listing.id !== id));
      toast.success('Listing deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

  return (
    <>
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't created any listings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="relative h-48">
                <img
                  src={listing.featured_image?.url || 'https://via.placeholder.com/400x300'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                <p className="mt-1 text-gray-500 text-sm truncate">{listing.description}</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">${listing.price}</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <div
                    onClick={onOpen}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </div>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    {/* // </div> */}
    </>
  );
}