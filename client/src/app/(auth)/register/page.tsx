'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
// import { useSignUp, useSignIn } from '@clerk/nextjs';
// import { useMutation } from '@apollo/client';
// import { SIGNUP_MUTATION } from '@/graphql/auth/mutations';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// import Google from '../../../../public/assets/google-logo.png';
// import LinkedIn from '../../../../public/assets/linkedin-logo.png';

interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const router = useRouter();

  // const { signUp, isLoaded } = useSignUp();
  // const { signIn } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupInput>();

  const password = watch('password');
  const email = watch('email');

  // const [signup] = useMutation(SIGNUP_MUTATION, {
  //   onCompleted: async () => {
  //     const res = await signIn?.create({
  //       identifier: email,
  //       password: password,
  //     });
  //     router.push('/verification-sent');
  //   },
  //   onError: (error) => {
  //     setSignUpError(error.message);
  //   },
  // });

  const onSubmit: SubmitHandler<SignupInput> = async (data) => {
    // if (!isLoaded) return;
    setIsLoading(true);
    try {
      // Temporary demo - just show loading state
      console.log('Form data:', data);
      setTimeout(() => {
        setIsLoading(false);
        alert('Registration form submitted! (Demo mode)');
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black font-montserrat">Create your account</h1>
        <p className="mt-2 text-base text-black font-dm-sans font-light">Let's get you started real quick</p>
      </div>

      <div className="mt-6 mx-auto w-[360px] bg-white rounded-3xl shadow-lg p-6">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-black font-dm-sans">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">✉️</span>
              <input
                {...register('email', { required: 'Email is required' })}
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-black font-dm-sans">Password</label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔒</span>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onFocus={() => setShowConfirmPassword(true)}
              />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {showConfirmPassword && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black font-dm-sans">Confirm Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full h-10 pl-3 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          )}

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              required
              className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-black font-dm-sans">
              I agree to the <a href="/terms" className="text-blue-800 underline">Terms and Conditions</a>
            </label>
          </div>

          {signUpError && <p className="text-sm text-red-500">{signUpError}</p>}

          <button
            type="submit"
            className={`w-full h-10 bg-[#040924] text-white rounded-full shadow-lg flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Sign Up'}
          </button>

          <div className="flex items-center gap-4">
            <hr className="flex-1 border-t border-gray-200" />
            <p className="text-sm text-gray-500 font-dm-sans">Or</p>
            <hr className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
              G
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs">
              in
            </button>
          </div>

          <div className="text-center flex justify-center gap-2">
            <p className="text-sm text-black font-dm-sans">Already a user?</p>
            <a href="/login" className="text-sm text-blue-800 underline font-dm-sans">Login</a>
          </div>
        </form>
      </div>
    </>
  );
}