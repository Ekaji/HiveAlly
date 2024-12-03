import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFormik } from 'formik';
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
  location: Yup.string()
    .min(2, 'Too Short!')
    .max(100, 'Too Long!')
    .required('Location is required'),
  profile_picture: Yup.string(),
});

export default function Profile() {
  // const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImg, setProfileImg] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<any>()

  // const {  } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      location: [currentLocation],
      profile_picture: profileImg,
      about: '',
      username: ''
    },
    validationSchema: ProfileSchema,
    onSubmit: async (values) => {
      try {
        const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...values,
          location: [currentLocation],
          updated_at: new Date().toISOString(),
        });
        
        console.log({currentLocation})
          console.log({values})
        if (error) throw error;

        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!event.target.files || event.target.files.length === 0) return;
  
  //   setUploading(true);
    
  //   try {
  //     const file = event.target.files[0];
  //     const filePath = generateFilePath(file.name);
      
  //     const publicUrl = await uploadImage(file, filePath);
  //     if (!publicUrl) throw new Error('Failed to retrieve public URL');
  
  //     formik.setFieldValue('profile_picture', publicUrl);
  //     await updateProfilePicture(publicUrl);
      
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  
  // const generateFilePath = (fileName: string) => {
  //   const fileExt = fileName.split('.').pop();
  //   return `${user?.id}-${Math.random()}.${fileExt}`;
  // };
  
  // const uploadImage = async (file: File, filePath: string) => {
  //   const { error: uploadError } = await supabase.storage
  //     .from('profile_img')
  //     .upload(filePath, file);
  
  //   if (uploadError) throw uploadError;
  
  //   const { data } = supabase.storage.from('profile_img').getPublicUrl(filePath);
  //   console.log({ publicUrl: data.publicUrl });
  //   return data.publicUrl;
  // };
  
  // const updateProfilePicture = async (publicUrl: string) => {
  //   const { error } = await supabase
  //     .from('profiles')
  //     .upsert({
  //       id: user?.id,
  //       profile_picture: publicUrl,
  //       updated_at: new Date().toISOString(),
  //     });
  
  //   if (error) {
  //     toast.error('failed to upload profile picture!');
  //     throw error;
  //   }
    
  //   toast.success('Profile picture updated successfully!');
  // };

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

        console.log({publicUrl})
        setProfileImg(publicUrl)
      // formik.setFieldValue('profile_picture', publicUrl);
      // await formik.submitForm();
      const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user?.id,
            profile_picture: publicUrl,
            updated_at: new Date().toISOString(),
          });
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
          formik.setFieldValue('location', data.location[0].formattedAddress ) || [];
          setCurrentLocation(data.location[0].formattedAddress)
          console.log({data})
          setIsEditing(!data.first_name); // Enable editing if profile is incomplete
        }
      } catch (error: any) {
        console.error('Error loading profile:', error.message);
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

            {/* <div className="flex flex-col md:flex-row md:space-x-4">
    <div className="flex-1">
        <label className="block text-xl font-bold mb-2">
            {isEditing ? "First Name" : "Name"}
        </label>
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
        <label className="block text-xl font-bold mb-2">
            {isEditing ? "Last Name" : " "}
        </label>
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
</div> */}


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
                <LocationInput currentLocation={currentLocation} setCurrentLocation={setCurrentLocation} isEditing={isEditing} />
              ) : (
                <>{currentLocation?.formattedAddress ? currentLocation?.formattedAddress : currentLocation }</>

              )
            }

            {formik.touched.location && formik?.errors?.location && (
              <p className="text-red-600 mt-1">{formik?.errors.location}</p>
            )}
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

  // return (
  //   <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  //     <div className="sm:mx-auto sm:w-full sm:max-w-md">
  //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
  //         {isEditing ? 'Edit Profile' : 'Your Profile'}
  //       </h2>
  //     </div>

  //     <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
  //       <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
  //         <div className="flex justify-end mb-4">
  //           <button
  //             type="button"
  //             onClick={() => setIsEditing(!isEditing)}
  //             className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  //           >
  //             {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
  //           </button>
  //         </div>

  //         <div className="mb-6 flex flex-col items-center">
  //           <div className="relative">
  //             <img
  //               src={
  //                 // formik.values.profile_picture 
  //                 profileImg
  //                 || 'https://via.placeholder.com/150'}
  //               alt="Profile"
  //               className="h-32 w-32 rounded-full object-cover"
  //             />
  //             {isEditing && (
  //               <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer">
  //                 <Upload className="h-4 w-4 text-white" />
  //                 <input
  //                   type="file"
  //                   className="hidden"
  //                   accept="image/*"
  //                   onChange={handleImageUpload}
  //                   disabled={uploading}
  //                 />
  //               </label>
  //             )}
  //           </div>
  //         </div>

  //         <form onSubmit={formik.handleSubmit} className="space-y-6">
  //           <div>
  //             <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
  //               First Name
  //             </label>
  //             <input
  //               id="first_name"
  //               type="text"
  //               {...formik.getFieldProps('first_name')}
  //               disabled={!isEditing}
  //               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
  //             />
  //             {formik.touched.first_name && formik.errors.first_name && (
  //               <p className="mt-2 text-sm text-red-600">{formik.errors.first_name}</p>
  //             )}
  //           </div>

  //           <div>
  //             <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
  //               Last Name
  //             </label>
  //             <input
  //               id="last_name"
  //               type="text"
  //               {...formik.getFieldProps('last_name')}
  //               disabled={!isEditing}
  //               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
  //             />
  //             {formik.touched.last_name && formik.errors.last_name && (
  //               <p className="mt-2 text-sm text-red-600">{formik.errors.last_name}</p>
  //             )}
  //           </div>

  //           <div>
  //             <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
  //               Phone Number
  //             </label>
  //             <input
  //               id="phone_number"
  //               type="tel"
  //               {...formik.getFieldProps('phone_number')}
  //               disabled={!isEditing}
  //               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
  //             />
  //             {formik.touched.phone_number && formik.errors.phone_number && (
  //               <p className="mt-2 text-sm text-red-600">{formik.errors.phone_number}</p>
  //             )}
  //           </div>

  //           <div>
  //             <label htmlFor="location" className="block text-sm font-medium text-gray-700">
  //               Location
  //             </label>
  //             <input
  //               id="location"
  //               type="text"
  //               {...formik.getFieldProps('location')}
  //               disabled={!isEditing}
  //               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:bg-gray-100"
  //             />
  //             {formik.touched.location && formik.errors.location && (
  //               <p className="mt-2 text-sm text-red-600">{formik.errors.location}</p>
  //             )}
  //           </div>

  //           {isEditing && (
  //             <button
  //               type="submit"
  //               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  //             >
  //               Save Changes
  //             </button>
  //           )}
  //         </form>
  //       </div>
  //     </div>
  //   </div>
  // );
}