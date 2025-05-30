import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-[#001f3f] to-[#003366] dark:from-[#001a33] dark:to-[#002b4d]">
      <Header />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-160px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto w-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 rounded-xl p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}