import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto w-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl backdrop-blur-sm bg-white/70 rounded-xl p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}