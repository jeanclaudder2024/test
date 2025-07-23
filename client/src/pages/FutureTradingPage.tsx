import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Globe, 
  Users,
  CheckCircle,
  Target,
  Building2,
  Ship,
  Anchor,
  Factory,
  ChevronRight,
  Smartphone,
  Brain,
  CreditCard,
  FileText,
  MapPin,
  AlertCircle,
  Rocket,
  Network,
  Lock,
  BarChart3
} from 'lucide-react';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set([...Array.from(prev), entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

export default function FutureTradingPage() {
  const visibleElements = useScrollAnimation();

  const uniqueFeatures = [
    {
      title: "Smart Infrastructure for Oil Trade",
      description: "We connect refineries to tankers, ports to deals, and brokers to corporations — all on a digitally managed and visually traceable network.",
      icon: <Network className="h-8 w-8 text-blue-400" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Protection of All Parties",
      description: "Whether you are a cargo owner, broker, or refinery, you will operate under deal protection logic — with suggested contract templates and data paths to protect your interest and commission.",
      icon: <Shield className="h-8 w-8 text-green-400" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Live Price Updates & Market Awareness",
      description: "We provide real-time indicators and market shifts, enabling decision-makers to negotiate with clarity and confidence.",
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Digital Policy First",
      description: "PetroDealHub is among the first platforms in petroleum trade to adopt a full digital governance strategy — eliminating paper-based inefficiencies and centralizing transactional data.",
      icon: <FileText className="h-8 w-8 text-orange-400" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "B2B Subscription Logic",
      description: "Only vetted professionals and companies may subscribe, enabling a trusted and credible trading environment.",
      icon: <Lock className="h-8 w-8 text-indigo-400" />,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const userTypes = [
    {
      title: "Oil Brokers & Deal Mediators",
      icon: <Users className="h-6 w-6 text-blue-400" />
    },
    {
      title: "Refinery Sales & Export Officers",
      icon: <Factory className="h-6 w-6 text-green-400" />
    },
    {
      title: "Tanker Owners and Charterers",
      icon: <Ship className="h-6 w-6 text-purple-400" />
    },
    {
      title: "Governmental & Private Buyers",
      icon: <Building2 className="h-6 w-6 text-orange-400" />
    },
    {
      title: "Port Operators and Cargo Officers",
      icon: <Anchor className="h-6 w-6 text-indigo-400" />
    },
    {
      title: "Commodity Trading Firms",
      icon: <BarChart3 className="h-6 w-6 text-teal-400" />
    },
    {
      title: "Shipping & Logistic Integrators",
      icon: <Globe className="h-6 w-6 text-amber-400" />
    }
  ];

  const futureVisions = [
    {
      title: "Blockchain-Secured Contracts",
      description: "Smart contract integration for real-time execution with payment linkage.",
      icon: <Lock className="h-8 w-8 text-blue-400" />
    },
    {
      title: "FOB/CIF Smart Deal Mapping",
      description: "Ability to dynamically generate shipment terms (FOB, CIF, CFR) and associated risk-sharing contracts.",
      icon: <MapPin className="h-8 w-8 text-green-400" />
    },
    {
      title: "Multi-Gateway Payment Tools",
      description: "Enabling B2B payment integrations — bank-to-bank, escrow logic, and digital settlement channels.",
      icon: <CreditCard className="h-8 w-8 text-purple-400" />
    },
    {
      title: "Mobile App Access",
      description: "Real-time deal notifications, port entry alerts, and cargo updates — on your phone.",
      icon: <Smartphone className="h-8 w-8 text-orange-400" />
    },
    {
      title: "AI-Based Predictive Shipping Flows",
      description: "Using AI to predict tanker traffic, pricing shifts, and optimal refinery routing.",
      icon: <Brain className="h-8 w-8 text-indigo-400" />
    },
    {
      title: "Regional Expansion Nodes",
      description: "Localized support hubs in Houston, Rotterdam, Fujairah, and Singapore.",
      icon: <Globe className="h-8 w-8 text-teal-400" />
    },
    {
      title: "Smart Customs & Compliance Alerts",
      description: "Document packs matched to destination country requirements and compliance scoring.",
      icon: <AlertCircle className="h-8 w-8 text-amber-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="future-trading" />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              id="hero"
              data-animate
              className={`transform transition-all duration-1000 ${
                visibleElements.has('hero') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Badge variant="secondary" className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20">
                Revolutionary Trading Platform
              </Badge>
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
                <Rocket className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
                The Future of Smart Petroleum Trading
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                Starts Here
              </p>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed mb-8">
                Welcome to PetroDealHub — the world's pioneering platform dedicated to revolutionizing the petroleum trade. We are not just a platform; we are a strategic infrastructure designed to digitally connect every critical pillar in the global oil ecosystem: refineries, ports, tankers, cargoes, brokers, and corporates — all in one powerful interface.
              </p>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed">
                With PetroDealHub, users no longer rely on outdated methods or fractured communication. Our digitally-native environment ensures that every shipment, deal, and partner is traceable, structured, and professionally accessible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Makes PetroDealHub Unique */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="unique-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('unique-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Makes PetroDealHub Unique
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {uniqueFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  id={`unique-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`unique-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl">
                          {feature.icon}
                        </div>
                        <Target className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-white/70 leading-relaxed flex-grow">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Uses PetroDealHub */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="users-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('users-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Who Uses PetroDealHub
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Our platform is designed for:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userTypes.map((user, index) => (
                <motion.div
                  key={index}
                  id={`user-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`user-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${300 + index * 75}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                        {user.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white">{user.title}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="scaling"
              data-animate
              className={`mt-16 text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 transform transition-all duration-1000 delay-800 ${
                visibleElements.has('scaling') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Zap className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Scales to Your Need
              </h3>
              <p className="text-xl text-white/80 leading-relaxed">
                Whether a solo broker or a global oil major, PetroDealHub scales to your need.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Future Visions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="future-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('future-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Future Visions: What We Are Building
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {futureVisions.map((vision, index) => (
                <motion.div
                  key={index}
                  id={`vision-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`vision-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                          {vision.icon}
                        </div>
                        <Rocket className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{vision.title}</h3>
                      <p className="text-white/70 leading-relaxed flex-grow">{vision.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* New Standard */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="standard-header"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('standard-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                A New Standard for Global Petroleum Transactions
              </h2>
            </motion.div>

            <motion.div
              id="standard-content"
              data-animate
              className={`bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 shadow-xl transform transition-all duration-1000 delay-400 ${
                visibleElements.has('standard-content') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                <p className="text-white/80 text-lg leading-relaxed">
                  At PetroDealHub, we're not just enabling deals — we're defining the new global standard for how petroleum trading operates in the digital era.
                </p>
                <p className="text-white/80 text-lg leading-relaxed">
                  Whether you're a first-time broker or a multinational buyer, our platform gives you visibility, structure, and opportunity in one seamless experience.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              id="cta"
              data-animate
              className={`transform transition-all duration-1000 delay-200 ${
                visibleElements.has('cta') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Join the Future of Petroleum Trading
              </h2>
              <p className="text-xl text-white/80 mb-12">
                Experience the world's most advanced petroleum trading platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Trading Smart
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Explore Features
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-in {
          animation: fadeInUp 0.7s ease-out forwards;
        }

        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}