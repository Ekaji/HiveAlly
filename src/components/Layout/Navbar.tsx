import { useSelector } from 'react-redux';
import { Bell, User } from 'lucide-react';
import { RootState } from '../../store/store';
import { Link, Outlet, useNavigate  } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile]= useState([])

  const navigate = useNavigate();

  const fetchProfile = async () => {
    if (user && user.id) {
      const { data, error } = await supabase
              .from('profile')
              .select('*')
              .eq('id', user.id);
              console.log({profileData:data})
              if (!error) setProfile(data || []);
      }
    }

  useEffect(() => {
    fetchProfile()
  }, [user])
  

  if (!user) {
    return (
      <>
        <header className="border-b-4 border-black bg-white">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-black">HiveAlly</h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/register"
                className="text-lg font-semibold border-2 border-black px-4 py-2 bg-yellow-300 hover:bg-black hover:text-white transition-colors"
              >
                List Space
              </Link>
              <Link
                to="/login"
                className="text-lg font-semibold border-2 border-black px-4 py-2 bg-blue-300 hover:bg-black hover:text-white transition-colors"
              >
                Find Space
              </Link>
              <Link
                to="/contact"
                className="text-lg font-semibold border-2 border-black px-4 py-2 bg-red-300 hover:bg-black hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </header>
        <Outlet />
      </>
    );
  }


  return (
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
              {
                profile.length > 0 ? (  <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={profile[0].profile_picture}
                  alt="Profile Pic"
                />) : (<User className="h-6 w-6 text-black" />)
              }
            </div>
            <span className="text-lg font-semibold text-black">
              {/* {user?.email} */}
            </span>
          </Link>
        </div>
      </div>
    </header>
    <Outlet />
    </>
  );
}
