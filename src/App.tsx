import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import { setUser } from './store/slices/authSlice';

// Layouts
import AuthLayout from './components/Layout/AuthLayout';
import Navbar from './components/Layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/user/Profile';
import Listings from './pages/user/Listings';
import Listing from './pages/listing';
import Onboarding from './pages/onboarding';
import UserInterestsPage from './pages/onboarding/UserInterests';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navbar />} >
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listing/:listingId" element={<Listing />} />
          </Route>

          <Route path="/onboarding" element={<Navbar />} >
            <Route path="setup" element={<Onboarding />} />
            <Route path="interests" element={<UserInterestsPage />} />
          </Route>

          {/* Protected routes */}
          <Route path="/user" element={<AuthLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="listings" element={<Listings />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}