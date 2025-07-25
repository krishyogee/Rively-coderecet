'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useLazyQuery } from '@apollo/client';
import { GET_CUSTOMER } from '@/graphql/customer/queries';
import Image from 'next/image';
import Google from '../../../../public/assets/google-logo.png';
import LinkedIn from '../../../../public/assets/linkedin-logo.png';
import { useAuth } from '@clerk/clerk-react';

interface LoginInput {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isLoaded: isAuthLoaded, sessionId } = useAuth();
  const router = useRouter();

  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [getCustomer, { data: customerData }] = useLazyQuery(GET_CUSTOMER);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit: SubmitHandler<LoginInput> = async ({ email, password }) => {
    if (!isLoaded) return;

    setIsLoading(true);
    setLoginError('');

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        await getCustomer();
      } else {
        setLoginError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setLoginError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoaded && sessionId) {
      router.replace('/');
    }
  }, [isAuthLoaded, sessionId]);

  useEffect(() => {
    if (customerData) {
      const isOnboarded = customerData.getCustomer.OnboardingCompletion;
      router.push(isOnboarded ? 'dashboard/home' : '/onboarding/getting-started');
    }
  }, [customerData]);

  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black font-montserrat">Welcome Back!</h1>
        <p className="mt-2 text-base text-black font-dm-sans font-light">Login to your account</p>
      </div>

      <div className="mt-6 mx-auto w-[360px] bg-white rounded-3xl shadow-lg p-6">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-black font-dm-sans">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">✉️</span>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-black font-dm-sans">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔒</span>
              <input
                {...register('password', { required: 'Password is required' })}
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {loginError && <p className="text-sm text-red-500">{loginError}</p>}

          <button
            type="submit"
            className={`w-full h-10 bg-[#040924] text-white rounded-full shadow-lg flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Login'}
          </button>

          <div className="flex items-center gap-4">
            <hr className="flex-1 border-t border-gray-200" />
            <p className="text-sm text-gray-500 font-dm-sans">Or</p>
            <hr className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <Image className="w-6 h-6" src={Google} alt="Google" />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <Image className="w-8 h-8" src={LinkedIn} alt="LinkedIn" />
            </button>
          </div>

          <div className="text-center flex justify-center gap-2">
            <p className="text-sm text-black font-dm-sans">Don’t have an account?</p>
            <a href="/register" className="text-sm text-blue-800 underline font-dm-sans">Sign up</a>
          </div>
        </form>
      </div>
    </>
  );
}