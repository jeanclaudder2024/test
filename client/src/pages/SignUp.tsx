import { SignUp } from '@clerk/clerk-react';
import { Ship, Navigation, AnchorIcon } from 'lucide-react';

export function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* App Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Ship className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Maritime Tracker</h1>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Side: Sign Up UI */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Create an Account</h2>
              <p className="text-gray-600 dark:text-gray-300">Sign up to access the maritime monitoring platform</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
              <SignUp
                routing="path"
                path="/signup"
                signInUrl="/login"
                redirectUrl="/"
              />
            </div>
          </div>
        </div>
        
        {/* Right Side: Maritime Illustration */}
        <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/maritime-background.svg')] opacity-10 bg-center bg-no-repeat bg-cover"></div>
          <div className="relative z-10 text-center p-8 max-w-lg">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-700 flex items-center justify-center">
                <AnchorIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Maritime Network</h2>
            <p className="text-blue-100 text-lg mb-6">
              Create an account to access advanced features, save preferences, and receive real-time maritime intelligence.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-700/30 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Live Vessel Tracking</h3>
                <p className="text-blue-100 text-sm">Monitor vessel movements in real-time across global shipping lanes</p>
              </div>
              <div className="bg-blue-700/30 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Port Analytics</h3>
                <p className="text-blue-100 text-sm">Access detailed information about ports, facilities, and capacities</p>
              </div>
              <div className="bg-blue-700/30 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Refinery Intelligence</h3>
                <p className="text-blue-100 text-sm">Track refinery status, capacity, and associated shipping activity</p>
              </div>
              <div className="bg-blue-700/30 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Document Management</h3>
                <p className="text-blue-100 text-sm">Generate and track maritime shipping documents seamlessly</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-4 px-6 shadow-inner">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Maritime Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}