import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Edit2, Save, Upload } from 'lucide-react';
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

export default function Profile() {
  // const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImg, setProfileImg] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationDetail[]>([{
      city: '',
      state: '',
      country: '',
      formattedAddress: '', // This should be required based on the schema
    }])


  if (loading)  <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  
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
        setIsEditing(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  // const formikRef = useRef();

  // const handleSetFormattedAddress = (address: {
  //   city: string; state: string; country: string; formattedAddress: string; }) => {
  //   if (formikRef.current) {
  //     formik.setFieldValue('location', [{ ...address }]);
  //   }
  // };

  useEffect(() => {
    formik.setFieldValue('location', [currentLocation[0]] )
  }, [currentLocation])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_img')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from('profile_img')
        .getPublicUrl(filePath);

        setProfileImg(publicUrl)
      // await formik.submitForm();
      console.log({publicUrl})
      if (formik.getFieldProps('username')){
        // if username exist perform an update

      }
      const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            profile_picture: publicUrl,
          });
          if(error) {
            toast.error(error.message);
          }
          if(!error) {
            toast.success('Profile picture updated successfully!');
          }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (error) {
          // throw error;
          toast.error('Failed to load profile!');
        }
        if (data) {
          setProfileImg(data.profile_picture)
          formik.setFieldValue('username', data.username );
          formik.setFieldValue('about', data.about) || '';
          formik.setFieldValue('first_name', data.first_name) || '';
          formik.setFieldValue('last_name', data.last_name) || '';
          formik.setFieldValue('phone_number', data.phone_number) || '';
          formik.setFieldValue('location', [{...data.location[0]}] ) || [];
          setCurrentLocation({...data.location})

          setIsEditing(!data.first_name); // Enable editing if profile is incomplete
        }
      } catch (error: any) {
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
        {/* Edit/Save Button */}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-black text-white px-4 py-2 hover:bg-gray-800"
          >
            {isEditing ? <Save className="h-6 w-6" /> : <Edit2 className="h-6 w-6" />}
          </button>
        </div>

        {/* Profile Image Section */}
        <div className="flex flex-col  mb-6">
          <div className="relative w-48 h-48 mb-4">
            <img
              src={profileImg || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-4 border-black"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer border-2 border-white">
                <Upload className="h-6 w-6" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Profile Details Section */}
        <form onSubmit={formik.handleSubmit} className="space-y-4 px-6 pb-6">
          <div>
              <label className="block text-xl font-bold mb-2">username</label>
              <input
                id="username"
                type="text"
                {...formik.getFieldProps('username')}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-white 
                  ${isEditing 
                    ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                    : 'border-0'
                  }`}
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <p className="text-red-600 mt-1">{formik.errors.last_name}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4">
    {isEditing ? (
        <>
            <div className="flex-1">
                <label className="block text-xl font-bold mb-2">First Name</label>
                <input
                    id="first_name"
                    type="text"
                    {...formik.getFieldProps('first_name')}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 bg-white 
                        ${isEditing 
                            ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                            : 'border-0'
                        }`}
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
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 bg-white 
                        ${isEditing 
                            ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                            : 'border-0'
                        }`}
                />
                {formik.touched.last_name && formik.errors.last_name && (
                    <p className="text-red-600 mt-1">{formik.errors.last_name}</p>
                )}
            </div>
        </>
    ) : (
        <div className="flex-1">
          <label className="block text-xl font-bold mb-2">Name</label>
            <p className="w-full px-3 py-2 bg-white ">
                {formik.values.first_name} {formik.values.last_name}
            </p>
        </div>
    )}
</div>
          <div>
            <label className="block text-xl font-bold mb-2">Phone Number</label>
            <input
              id="phone_number"
              type="tel"
              {...formik.getFieldProps('phone_number')}
              disabled={!isEditing}
              className={`w-full px-3 py-2 bg-white 
                ${isEditing 
                  ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                  : 'border-0'
                }`}
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
              disabled={!isEditing}
              className={`w-full px-3 py-2 bg-w hite 
                ${isEditing 
                  ? 'border-4 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black' 
                  : 'border-0'
                }`}
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <p className="text-red-600 mt-1">{formik.errors.last_name}</p>
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
            {
              isEditing ? (
                <LocationInput currentLocation={currentLocation[0]} setCurrentLocation={setCurrentLocation} isEditing={isEditing} />
              ) : (
                <>{ 
                  currentLocation[0].formattedAddress
                   }</>
              )
            }
            
            {formik.touched.location && formik.errors.location && formik.errors.location[0] ? (
              <p className="text-red-600 mt-1">
                {(formik.errors.location[0] as FormikErrors<LocationDetail>).formattedAddress}
              </p>
            ) : null}
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full bg-black text-white py-3 text-xl hover:bg-gray-800"
            >
              Save Changes
            </button>
          )}
        </form>
        
      </div>
    </div>
  );
}