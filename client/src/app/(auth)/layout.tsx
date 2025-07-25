'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import RivelyLogo from '../../../public/assets/rively-logo.svg';
import Google from '../../../public/assets/google-logo.png';
import LinkedIn from '../../../public/assets/linkedin-logo.png';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip redirect for verification routes
    if (
      isLoaded &&
      userId &&
      !pathname.startsWith('/verify-account') &&
      !pathname.startsWith('/verification/verification-sent')
    ) {
      router.replace('/');
    }
  }, [isLoaded, userId, router, pathname]);

  if (!isLoaded) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div>Loading</div>
      </div>
    );
  }

  // Determine if the page is a verification page
  const isVerificationPage =
    pathname.startsWith('/verify-account') ||
    pathname.startsWith('/verification-sent');

  return (
    <div className="relative flex h-screen bg-white font-sans overflow-hidden">
      {/* Main Layout */}
      <div className="w-1/2 flex flex-col p-8 justify-start mt-10 relative">
        {/* Logo */}
        <div className="flex items-center gap-2 absolute top-0 left-8">
          <Image src={RivelyLogo} alt="Rively Logo" width={32} height={32} />
          <span className="text-black font-bold text-lg">RIVELY</span>
        </div>
        
        {/* Content Area */}
        <div className="flex items-center justify-center min-h-screen">
          {!isVerificationPage ? (
            // Regular auth pages (login, register, etc.)
            <div className="w-full max-w-md fixed top-20">
              {children}
            </div>
          ) : (
            // Dimmed background content for verification pages - FIXED: Changed from top-14 to top-20
            <div className="fixed top-20">
              <div className="text-center opacity-50 pointer-events-none">
                <h1 className="text-4xl font-bold text-black font-montserrat">Create your account</h1>
                <p className="mt-2 text-base text-black font-dm-sans font-light">Let's get you started real quick</p>
              </div>
              <div className="mt-6 mx-auto w-[360px] bg-white rounded-3xl shadow-lg p-6 opacity-50 pointer-events-none">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-black font-dm-sans">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">✉️</span>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="block text-sm font-medium text-black font-dm-sans">Password</label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔒</span>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-black font-dm-sans">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full h-10 pl-3 pr-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled
                    />
                    <label className="text-sm text-black font-dm-sans">
                      I agree to the <a href="/terms" className="text-blue-800 underline">Terms and Conditions</a>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="w-full h-10 bg-[#040924] text-white rounded-full shadow-lg flex items-center justify-center opacity-70 cursor-not-allowed"
                    disabled
                  >
                    Sign Up
                  </button>
                  <div className="flex items-center gap-4">
                    <hr className="flex-1 border-t border-gray-200" />
                    <p className="text-sm text-gray-500 font-dm-sans">Or</p>
                    <hr className="flex-1 border-t border-gray-200" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center" disabled>
                      <Image className="w-6 h-6" src={Google} alt="Google" />
                    </button>
                    <button className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center" disabled>
                      <Image className="w-8 h-8" src={LinkedIn} alt="LinkedIn" />
                    </button>
                  </div>
                  <div className="text-center flex justify-center gap-2">
                    <p className="text-sm text-black font-dm-sans">Already a user?</p>
                    <a href="/login" className="text-sm text-blue-800 underline font-dm-sans">Login</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Decorative Circles */}
      <div className="w-1/2 relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-4 border-[#1C4F82] rounded-full flex items-center justify-center">
          <div className="w-[800px] h-[800px] border-4 border-gray-400 rounded-full flex items-center justify-center">
            <div className="flex flex-col gap-16">
              <div className="w-[580px] bg-white rounded-lg shadow-md p-6 ml-20">
                <p className="text-lg text-black font-poppins">Airtable and Notion are two highly rated project management software solutions.</p>
                <span className="block text-sm text-gray-500 font-inter mt-2 text-right">- India Today</span>
              </div>
              <div className="w-[700px] bg-[#0826BC] rounded-lg shadow-lg p-6 mr-16">
                <p className="text-lg text-white font-poppins">Moon Pay now offers Tether (ERC-20) swaps with no processing fee and has earned an ISO 27001 Certification.</p>
                <span className="block text-sm text-yellow-400 font-inter mt-2 text-right">- The Hindu</span>
              </div>
              <div className="w-[580px] bg-white rounded-lg shadow-md p-6 ml-20">
                <p className="text-lg text-black font-poppins">Airtable and Notion are two highly rated project management software solutions.</p>
                <span className="block text-sm text-gray-500 font-inter mt-2 text-right">- India Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Component Overlay - Centered over entire page */}
      {isVerificationPage && (
        <>
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black/50 z-50"></div>
          {/* Verification component centered */}
          <div className="fixed inset-0 flex items-center justify-center z-[60]">
            {children}
          </div>
        </>
      )}
    </div>
  );
}