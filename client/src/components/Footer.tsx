import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800/50 py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 font-bold text-2xl mb-4">
              <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto" />
              <span className="text-white sr-only">PetroDealHub</span>
            </div>
            <p className="text-white/60 mb-6 max-w-md">
              The premier platform for petroleum trading professionals, providing real-time tanker tracking, 
              refinery intelligence, and smart document automation.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white/60 hover:text-orange-500 hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-white/60 hover:text-orange-500">Features</Link></li>
              <li><Link href="#how-it-works" className="text-white/60 hover:text-orange-500">How It Works</Link></li>
              <li><Link href="/pricing" className="text-white/60 hover:text-orange-500">Pricing</Link></li>
              <li><Link href="/refineries" className="text-white/60 hover:text-orange-500">Refineries</Link></li>
              <li><Link href="/vessels" className="text-white/60 hover:text-orange-500">Vessels</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-white/60 hover:text-orange-500">Blog</Link></li>
              <li><Link href="/documentation" className="text-white/60 hover:text-orange-500">Documentation</Link></li>
              <li><Link href="/support" className="text-white/60 hover:text-orange-500">Support</Link></li>
              <li><Link href="/api-integration" className="text-white/60 hover:text-orange-500">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/60 hover:text-orange-500">About Us</Link></li>
              <li><Link href="/careers" className="text-white/60 hover:text-orange-500">Careers</Link></li>
              <li><Link href="/privacy" className="text-white/60 hover:text-orange-500">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/60 hover:text-orange-500">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-orange-500">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-white/50">
            © 2025 PetroDealHub. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <a href="#" className="text-sm text-white/50 hover:text-orange-500">Privacy Policy</a>
            <span className="text-white/30">|</span>
            <a href="#" className="text-sm text-white/50 hover:text-orange-500">Terms of Service</a>
            <span className="text-white/30">|</span>
            <a href="#" className="text-sm text-white/50 hover:text-orange-500">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}