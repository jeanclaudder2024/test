import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Shield, 
  Zap, 
  Database, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Server, 
  Lock,
  BarChart3,
  FileText,
  Activity,
  Settings,
  Building2
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from 'wouter';
import { useEffect, useState } from 'react';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleElements(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return visibleElements;
};

export default function ApiIntegration() {
  const visibleElements = useScrollAnimation();

  const apiFeatures = [
    {
      title: "Track tankers in real-time and receive automated status updates",
      icon: Activity,
      color: "text-blue-400"
    },
    {
      title: "Integrate deal documentation directly into your back-office systems",
      icon: FileText,
      color: "text-green-400"
    },
    {
      title: "Map refinery capabilities and match them to shipment specs",
      icon: Building2,
      color: "text-orange-400"
    },
    {
      title: "Verify offers and documents via API before executing transactions",
      icon: Shield,
      color: "text-purple-400"
    },
    {
      title: "Build custom dashboards for your team using live trading data",
      icon: BarChart3,
      color: "text-cyan-400"
    },
    {
      title: "Automate compliance checks and broker activity reports",
      icon: Settings,
      color: "text-red-400"
    }
  ];

  const consultationSteps = [
    {
      title: "Understand your integration needs",
      description: "Analyze your current systems and workflow requirements",
      icon: Database
    },
    {
      title: "Evaluate your system security",
      description: "Ensure compliance with enterprise security standards",
      icon: Shield
    },
    {
      title: "Discuss data access levels and scope",
      description: "Define appropriate API permissions and data boundaries",
      icon: Lock
    },
    {
      title: "Provide API keys and technical onboarding",
      description: "Complete setup with documentation and support",
      icon: Code
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="api" />

      {/* Custom CSS for scroll animations */}
      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .scroll-animate.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        .stagger-5 { transition-delay: 0.5s; }
        
        .scale-in {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.6s ease-out;
        }
        
        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        .slide-in-left {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s ease-out;
        }
        
        .slide-in-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .slide-in-right {
          opacity: 0;
          transform: translateX(50px);
          transition: all 0.8s ease-out;
        }
        
        .slide-in-right.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content */}
      <div className="pt-40">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-950 via-[#003366] to-slate-900">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,111,0,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,51,102,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_70%)]"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')] opacity-30"></div>
          
          {/* Code-themed floating elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-green-500/30 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-600/40 rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 right-10 w-1 h-1 bg-cyan-300/50 rounded-full animate-ping"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge 
                id="hero-badge"
                variant="outline" 
                className={`mb-6 bg-blue-500/10 text-blue-300 border-blue-500/30 px-4 py-2 scroll-animate ${visibleElements.has('hero-badge') ? 'visible' : ''} scale-in`}
              >
                <Code className="h-4 w-4 mr-2 float-animation" />
                API Integration
              </Badge>
              <h1 
                id="hero-title"
                className={`text-4xl md:text-6xl font-bold mb-8 text-white scroll-animate ${visibleElements.has('hero-title') ? 'visible' : ''} stagger-1`}
              >
                Seamless Connectivity for Leading <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 float-animation">Oil & Energy Enterprises</span>
              </h1>
              <p 
                id="hero-desc1"
                className={`text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('hero-desc1') ? 'visible' : ''} stagger-2`}
              >
                At PetroDealHub, we recognize that major trading firms, refineries, brokers, and maritime operators demand more than just visibility — they need direct integration into their internal systems to accelerate deal flow, monitor movements, and secure transactions with precision.
              </p>
              <p 
                id="hero-desc2"
                className={`text-lg text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('hero-desc2') ? 'visible' : ''} stagger-3`}
              >
                That's why we offer exclusive access to our PetroDealHub API — a secure, enterprise-grade interface designed to empower your systems with real-time oil trade data, shipment insights, deal tracking, refinery mapping, and more.
              </p>
            </div>
          </div>
        </section>

        {/* API Features Section */}
        <section className="py-24 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge 
                  id="features-badge"
                  variant="outline" 
                  className={`mb-4 bg-blue-500/10 text-blue-300 border-blue-500/30 scroll-animate ${visibleElements.has('features-badge') ? 'visible' : ''} scale-in`}
                >
                  🔗 What Can You Do with PetroDealHub API?
                </Badge>
                <h2 
                  id="features-title"
                  className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('features-title') ? 'visible' : ''} stagger-1`}
                >
                  Enterprise-Grade Integration
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-16">
                {apiFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  const featureId = `feature-${index}`;
                  return (
                    <Card 
                      key={index} 
                      id={featureId}
                      className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group h-full scroll-animate ${visibleElements.has(featureId) ? 'visible' : ''} stagger-${(index % 5) + 1}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform mt-1">
                            <IconComponent className={`h-6 w-6 ${feature.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white/80 leading-relaxed font-medium">
                              • {feature.title}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div 
                id="api-description"
                className={`text-center scroll-animate ${visibleElements.has('api-description') ? 'visible' : ''} stagger-3`}
              >
                <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
                  Our API is built for secure, scalable, high-performance environments, enabling true digital transformation in the petroleum supply chain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Access Section */}
        <section className="py-24 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge 
                id="enterprise-badge"
                variant="outline" 
                className={`mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 scroll-animate ${visibleElements.has('enterprise-badge') ? 'visible' : ''} scale-in`}
              >
                📌 Enterprise-Only Access
              </Badge>
              <h2 
                id="enterprise-title"
                className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('enterprise-title') ? 'visible' : ''} stagger-1`}
              >
                Vetted Enterprise Clients Only
              </h2>
              <p 
                id="enterprise-desc"
                className={`text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('enterprise-desc') ? 'visible' : ''} stagger-2`}
              >
                Access to PetroDealHub's API is not public and is currently limited to vetted enterprise clients only.
                If your organization is interested in API access, please contact us directly. We'll schedule a consultation to:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {consultationSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const stepId = `step-${index}`;
                  return (
                    <Card 
                      key={index} 
                      id={stepId}
                      className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group scroll-animate ${visibleElements.has(stepId) ? 'visible' : ''} stagger-${(index % 4) + 1}`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5 text-orange-400" />
                          </div>
                          <CardTitle className="text-white text-lg">• {step.title}</CardTitle>
                        </div>
                        <CardDescription className="text-white/70 leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-[#003366] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_40%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge 
                id="contact-badge"
                variant="outline" 
                className={`mb-6 bg-green-500/10 text-green-300 border-green-500/30 scroll-animate ${visibleElements.has('contact-badge') ? 'visible' : ''} scale-in`}
              >
                📞 Request Access
              </Badge>
              <h2 
                id="contact-title"
                className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('contact-title') ? 'visible' : ''} stagger-1`}
              >
                Get Started with Enterprise API
              </h2>
              <p 
                id="contact-desc"
                className={`text-white/80 text-lg mb-12 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('contact-desc') ? 'visible' : ''} stagger-2`}
              >
                To request access to our enterprise API, please contact our Business Solutions team:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div 
                  id="contact-email"
                  className={`bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 scroll-animate ${visibleElements.has('contact-email') ? 'visible' : ''} stagger-3`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Mail className="h-8 w-8 text-green-400 float-animation" />
                    <div>
                      <p className="text-white font-medium mb-2">📧 Email</p>
                      <a 
                        href="mailto:api@petrodealhub.com" 
                        className="text-green-400 hover:text-green-300 font-bold transition-colors hover:scale-105 inline-block"
                      >
                        api@petrodealhub.com
                      </a>
                    </div>
                  </div>
                </div>

                <div 
                  id="contact-phone"
                  className={`bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 scroll-animate ${visibleElements.has('contact-phone') ? 'visible' : ''} stagger-4`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <Phone className="h-8 w-8 text-blue-400 float-animation" />
                    <div>
                      <p className="text-white font-medium mb-2">📞 Phone</p>
                      <a 
                        href="tel:+18005554271" 
                        className="text-blue-400 hover:text-blue-300 font-bold transition-colors hover:scale-105 inline-block"
                      >
                        +1 (800) 555-API1
                      </a>
                    </div>
                  </div>
                </div>

                <div 
                  id="contact-location"
                  className={`bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 scroll-animate ${visibleElements.has('contact-location') ? 'visible' : ''} stagger-5`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <MapPin className="h-8 w-8 text-purple-400 float-animation" />
                    <div>
                      <p className="text-white font-medium mb-2">📍 Location</p>
                      <p className="text-purple-400 font-bold">
                        United States, with international coverage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Message Section */}
        <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge 
                id="future-badge"
                variant="outline" 
                className={`mb-6 bg-cyan-500/10 text-cyan-300 border-cyan-500/30 scroll-animate ${visibleElements.has('future-badge') ? 'visible' : ''} scale-in`}
              >
                💡 Build the Future of Petroleum Trading
              </Badge>
              <div 
                id="final-message"
                className={`bg-slate-800/30 rounded-3xl p-12 border border-blue-500/20 backdrop-blur-sm scroll-animate ${visibleElements.has('final-message') ? 'visible' : ''} scale-in hover:bg-slate-800/40 transition-all duration-500`}
              >
                <p 
                  id="final-desc"
                  className={`text-xl text-white/80 mb-8 leading-relaxed scroll-animate ${visibleElements.has('final-desc') ? 'visible' : ''} stagger-1`}
                >
                  PetroDealHub is more than a platform — it's a connected ecosystem designed for speed, scale, and trust. If your company is ready to integrate with the future of oil trade infrastructure, we're ready to build with you.
                </p>
                
                <h2 
                  id="final-title"
                  className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 float-animation scroll-animate ${visibleElements.has('final-title') ? 'visible' : ''} stagger-2`}
                >
                  PetroDealHub API – Secure. Connected. Built for Enterprise.
                </h2>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}