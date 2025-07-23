import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Shield, 
  Cookie, 
  Settings, 
  BarChart3, 
  Users, 
  Target,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return elementRef;
};

const PolicySection = ({ 
  title, 
  children, 
  icon: Icon, 
  delay = 0 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: any; 
  delay?: number;
}) => {
  const ref = useScrollAnimation();

  return (
    <div 
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-700 ease-out mb-12"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-slate-300 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const CookieTypeCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color = "blue" 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]} hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-5 w-5" />
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
};

export default function CookiePolicy() {
  const heroRef = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header currentPage="cookie-policy" />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div 
            ref={heroRef}
            className="text-center max-w-4xl mx-auto opacity-0 translate-y-8 transition-all duration-1000 ease-out"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/20 rounded-2xl backdrop-blur-sm border border-blue-500/30">
                <Cookie className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Understanding how PetroDealHub uses cookies and similar technologies to enhance your experience
            </p>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/50 text-slate-300">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Effective Date: July 19, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 pb-16">
        {/* Introduction */}
        <PolicySection title="Cookie Policy Overview" icon={Cookie} delay={100}>
          <p>
            This Cookie Policy explains how PetroDealHub ("we," "our," or "us") uses cookies and similar 
            technologies on our platform. By continuing to use our website, you consent to our use of 
            cookies as described below.
          </p>
        </PolicySection>

        {/* What Are Cookies */}
        <PolicySection title="What Are Cookies?" icon={Settings} delay={200}>
          <p>
            Cookies are small data files stored on your device when you visit a website. They are widely 
            used to make websites function more efficiently and to provide data for performance, analytics, 
            personalization, and security.
          </p>
        </PolicySection>

        {/* Why We Use Cookies */}
        <PolicySection title="Why We Use Cookies" icon={BarChart3} delay={300}>
          <p>We use cookies to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Ensure the platform functions properly</li>
            <li>Maintain user sessions and log-in states</li>
            <li>Analyze traffic and usage patterns to improve performance</li>
            <li>Remember user preferences</li>
            <li>Deliver relevant content and improve user experience</li>
            <li>Secure access to subscription features</li>
          </ul>
        </PolicySection>

        {/* Types of Cookies */}
        <PolicySection title="Types of Cookies We Use" icon={Users} delay={400}>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <CookieTypeCard
              title="Essential Cookies"
              description="Required for the basic operation of the platform, such as user login, navigation, and secure access."
              icon={Shield}
              color="blue"
            />
            <CookieTypeCard
              title="Analytics Cookies"
              description="Used to collect anonymous data about how users interact with the platform. These insights help us improve system performance and user experience."
              icon={BarChart3}
              color="green"
            />
            <CookieTypeCard
              title="Preference Cookies"
              description="Remember your preferences such as language, time zone, or default settings."
              icon={Settings}
              color="orange"
            />
            <CookieTypeCard
              title="Marketing and Retargeting Cookies"
              description="We may use limited tracking technologies to understand visitor interest. We do not use invasive advertising cookies or sell user data."
              icon={Target}
              color="purple"
            />
          </div>
        </PolicySection>

        {/* Managing Cookies */}
        <PolicySection title="Managing Cookies" icon={Settings} delay={500}>
          <p>
            You can control or disable cookies through your browser settings. Please note that disabling 
            essential cookies may limit access to parts of the platform or impact its functionality.
          </p>
        </PolicySection>

        {/* Third-Party Tools */}
        <PolicySection title="Third-Party Tools" icon={Users} delay={600}>
          <p>
            We may use third-party tools (e.g., traffic analytics, session monitoring) that also rely on 
            cookies. These tools are selected based on their professional standards and privacy commitments. 
            We are not responsible for their policies.
          </p>
        </PolicySection>

        {/* Your Consent */}
        <PolicySection title="Your Consent" icon={Shield} delay={700}>
          <p>
            By using our platform, you agree to the placement of cookies as described. You may withdraw 
            your consent at any time by changing your browser settings.
          </p>
        </PolicySection>

        {/* Contact Information */}
        <PolicySection title="Contact Us" icon={Mail} delay={800}>
          <p className="mb-6">
            If you have questions about our Cookie Policy, please contact:
          </p>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
            <h4 className="text-lg font-semibold text-white mb-4">PetroDealHub Legal Department</h4>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <a 
                  href="mailto:privacy@petrodealhub.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  privacy@petrodealhub.com
                </a>
              </div>
            </div>
          </div>
        </PolicySection>
      </main>

      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeInUp 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}