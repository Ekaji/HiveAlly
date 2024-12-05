import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { LocationInput } from '../../components/LocationInput';

const ProfileSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('First name is required'),
  last_name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Last name is required'),
  phone_number: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Phone number is required'),
  about: Yup.string(),
  location: Yup.array().of(
      Yup.object().shape({
          city: Yup.string(),
          state: Yup.string(),
          country: Yup.string(),
          formattedAddress: Yup.string().required()
  })),
});


interface LocationDetail {
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

// Define the shape of your form values
interface FormValues {
  first_name: string;
  last_name: string;
  phone_number: string;
  location: LocationDetail[];
  about: string;
  username: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setLoading] = useState(false);
//   const [profileImg, setProfileImg] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationDetail[]>([{
      city: '',
      state: '',
      country: '',
      formattedAddress: '', // This should be required based on the schema
    }])


  if (isLoading)  <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  
  if (!user)  <Navigate to="/login" replace />;

  const formik = useFormik<FormValues>({
    initialValues : {
      first_name: '',
      last_name: '',
      phone_number: '',
      location: [{
        city: '',
        state: '',
        country: '',
        formattedAddress: '', // This should be required based on the schema
      }],
      about: '',
      username: '',
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
    setLoading(true);
      try {
        const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...values,
          updated_at: new Date().toISOString(),
        });
        
        if (error) throw error;

        toast.success('Profile updated successfully!');
        setLoading(false)
        navigate('/onboarding/interests')
        setIsEditing(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue('location', [currentLocation[0]] )
  }, [currentLocation])

  useEffect(() => {
    const getProfile = async () => {
        setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

          if (error) {
            // Handle error scenarios
            if (error.message.includes('not found')) {
                console.log('Item not found:', error.message);
                navigate('/login');
                setLoading(false)
                return;
            } else {
                setLoading(false)
                console.error('Error fetching item:', error.message);
                throw new Error('Error fetching item');
            }
        }
        if (data) {
         if( data.username && data.first_name && data.last_name ) {
            setLoading(false)
            navigate('/');
         }

        }
      } catch (error: any) {
        setLoading(false)
        toast.error('Error loading profile:', error.message);
      }
    };

    if (user?.id) {
      getProfile();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-neutral-100 p-0 font-mono">
      <div className="max -w-md mx-auto bg-white p-10">
        {/* Profile Details Section */}
        <form onSubmit={formik.handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
              <label className="block text-xl font-bold mb-2">username</label>
              <input
                id="username"
                type="text"
                {...formik.getFieldProps('username')}
                className={`w-full px-3 py-2 bg-white `}
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <p className="text-red-600 mt-1">{formik.errors.last_name}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
    
        <>
            <div className="flex-1">
                <label className="block text-xl font-bold mb-2">First Name</label>
                <input
                    id="first_name"
                    type="text"
                    {...formik.getFieldProps('first_name')}
                    
                    className={`w-full px-3 py-2 bg-white`}
                />
                {formik.touched.first_name && formik.errors.first_name && (
                    <p className="text-red-600 mt-1">{formik.errors.first_name}</p>
                )}
            </div>

            <div className="flex-1">
                <label className="block text-xl font-bold mb-2">Last Name</label>
                <input
                    id="last_name"
                    type="text"
                    {...formik.getFieldProps('last_name')}
                    
                    className={`w-full px-3 py-2 bg-white `}
                />
                {formik.touched.last_name && formik.errors.last_name && (
                    <p className="text-red-600 mt-1">{formik.errors.last_name}</p>
                )}
            </div>
        </>
</div>
          <div>
            <label className="block text-xl font-bold mb-2">Phone Number</label>
            <input
              id="phone_number"
              type="tel"
              {...formik.getFieldProps('phone_number')}
              className={`w-full px-3 py-2 bg-white `}
            />
            {formik.touched.phone_number && formik.errors.phone_number && (
              <p className="text-red-600 mt-1">{formik.errors.phone_number}</p>
            )}
          </div>       
        {/* About Section */}
        <div className="pb-6">
          <h2 className="text-2xl font-bold mb-4">About Me</h2>
          <div className="text-lg p-4 bg-neutral-100">
          <input
              id="about"
              type="text"
              {...formik.getFieldProps('about')}
              
              className={`w-full px-3 py-2 bg-w hite `}
            />
            {formik.touched.about && formik.errors.about && (
              <p className="text-red-600 mt-1">{formik.errors.about}</p>
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div className=" pb-6">
          <h2 className="text-2xl font-bold mb-4">Interests</h2>
          <div className="flex flex-wrap gap-4">
            {['Photography', 'Hiking', 'Technology', 'Reading', 'Cooking', 'Travel', 'Music', 'Design'].map((interest) => (
              <span 
                key={interest} 
                className="px-4 py-2 bg-neutral-100 rounded-full text-lg"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

          <div>
            <label className="block text-xl font-bold mb-2">Location</label> 
            <LocationInput currentLocation={currentLocation[0]} setCurrentLocation={setCurrentLocation} isEditing={isEditing} />
            
            {formik.touched.location && formik.errors.location && formik.errors.location[0] ? (
              <p className="text-red-600 mt-1">
                {(formik.errors.location[0] as FormikErrors<LocationDetail>).formattedAddress}
              </p>
            ) : null}
          </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 text-xl hover:bg-gray-800"
            >
              Save Changes
            </button>
          
        </form>
        
      </div>
    </div>
  );
}