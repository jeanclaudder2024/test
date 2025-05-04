import { SignIn } from '@clerk/clerk-react';
import { Ship, Navigation, AnchorIcon } from 'lucide-react';

export function Login() {
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
        {/* Left Side: Login UI */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-300">Log in to access the maritime monitoring platform</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 border border-gray-200 dark:border-gray-700">
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/signup"
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
                <Navigation className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Global Maritime Intelligence</h2>
            <p className="text-blue-100 text-lg mb-6">
              Track vessels, monitor shipments, and gain valuable insights into maritime operations around the world.
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">2,500+</div>
                <div className="text-blue-200">Vessels Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">70+</div>
                <div className="text-blue-200">Refineries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">80+</div>
                <div className="text-blue-200">Global Ports</div>
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