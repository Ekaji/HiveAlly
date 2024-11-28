import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { UserPlus } from 'lucide-react';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterForm() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        if (data.user) {
          toast.success('Registration successful! Please complete your profile.');
          navigate('/user/profile');
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          {...formik.getFieldProps('email')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {formik.touched.email && formik.errors.email && (
          <p className="mt-2 text-sm text-red-600">{formik.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...formik.getFieldProps('password')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {formik.touched.password && formik.errors.password && (
          <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...formik.getFieldProps('confirmPassword')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600">{formik.errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="w-full flex justify-center items-center gap-2 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {formik.isSubmitting ? (
          'Loading...'
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Register
          </>
        )}
      </button>
    </form>
  );
}