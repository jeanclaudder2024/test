import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Users, 
  FileText, 
  Shield, 
  Globe, 
  Star,
  CheckCircle,
  TrendingUp,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Crown,
  Target,
  Handshake,
  Lock,
  CreditCard,
  ChevronRight
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

export default function BecomeABroker() {
  const visibleElements = useScrollAnimation();

  const benefits = [
    {
      title: "A PetroDealHub Global Broker ID™",
      icon: <Award className="h-6 w-6 text-blue-400" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "A Physical or Digital Membership Card with your verified broker identity",
      icon: <CreditCard className="h-6 w-6 text-green-400" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Visibility in deal networks with buyers and sellers from 100+ countries",
      icon: <Globe className="h-6 w-6 text-purple-400" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Early access to petroleum deal flows, refineries, and shipping schedules",
      icon: <TrendingUp className="h-6 w-6 text-orange-400" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Special facilitation pathways and preferential connections with global energy players",
      icon: <Handshake className="h-6 w-6 text-indigo-400" />,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const whyBecomeBroker = [
    {
      title: "Participate in Real Transactions",
      description: "Mediate verified cargo and refinery deals across the globe.",
      icon: <Target className="h-8 w-8 text-blue-400" />
    },
    {
      title: "Access Legal Templates",
      description: "Use internationally recognized contract models to protect your position and formalize your participation.",
      icon: <Shield className="h-8 w-8 text-green-400" />
    },
    {
      title: "Gain Professional Identity",
      description: "Elevate your status within the oil trading world through official membership and deal credentials.",
      icon: <Crown className="h-8 w-8 text-purple-400" />
    },
    {
      title: "Unlock Support & Training",
      description: "PetroDealHub provides documentation, deal path guidance, and professional advisory access.",
      icon: <Users className="h-8 w-8 text-orange-400" />
    }
  ];

  const contracts = [
    "LOI (Letter of Intent)",
    "ICPO (Irrevocable Corporate Purchase Order)",
    "NCNDA (Non-Circumvention, Non-Disclosure Agreement)",
    "IMFPA (International Master Fee Protection Agreement)",
    "SPA (Sale and Purchase Agreement)",
    "Tank Storage Agreement (TSA)",
    "Charter Party Agreement",
    "B/L (Bill of Lading)",
    "SGS/CIQ Inspection Reports",
    "POP (Proof of Product)",
    "SCO (Soft Corporate Offer)"
  ];

  const globalCompanies = [
    "Shell", "Aramco", "Rosneft", "Lukoil", "TotalEnergies", "BP", 
    "ExxonMobil", "Chevron", "ADNOC", "Gazprom", "PetroChina", 
    "ENI", "Equinor", "Reliance", "Sinopec"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="become-broker" />
      
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
              <Badge variant="secondary" className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20">
                Professional Certification Program
              </Badge>
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full mb-6">
                <Award className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Become a Certified Petroleum Broker
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                Empowering Global Mediators Through PetroDealHub
              </p>
              <p className="text-lg text-white/70 max-w-5xl mx-auto leading-relaxed mb-8">
                At PetroDealHub, we believe that every verified subscriber should have the opportunity to evolve into a Certified Petroleum Broker or Deal Mediator — with real influence over international oil transactions.
              </p>
              <p className="text-lg text-white/70 max-w-5xl mx-auto leading-relaxed">
                After subscribing, users may apply to become platform-certified brokers, gaining access to exclusive deal pipelines, refinery and tanker data, legal contract templates, and communication tools to mediate real petroleum deals under platform protection.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why Become a Broker */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="why-broker"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('why-broker') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Become a Broker or Mediator?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {whyBecomeBroker.map((reason, index) => (
                <motion.div
                  key={index}
                  id={`reason-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`reason-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      {reason.icon}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                        <p className="text-white/70 leading-relaxed">{reason.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Broker Membership Benefits */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="benefits"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('benefits') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Your Global Broker Membership Benefits
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Upon approval into our Broker Program, you'll receive:
              </p>
            </motion.div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  id={`benefit-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`benefit-${index}`) 
                      ? 'translate-x-0 opacity-100' 
                      : index % 2 === 0 ? 'translate-x-10 opacity-0' : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-green-500/20 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0" />
                    <div className="flex items-center space-x-4">
                      {benefit.icon}
                      <p className="text-white/80 text-lg leading-relaxed">{benefit.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Global Companies */}
            <motion.div
              id="companies"
              data-animate
              className={`mt-16 transform transition-all duration-1000 delay-800 ${
                visibleElements.has('companies') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Connect with Global Energy Leaders
                </h3>
                <p className="text-white/80 text-center mb-8">
                  Special facilitation pathways and preferential connections with global energy players across 5 continents:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {globalCompanies.map((company, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-900/30 text-blue-300 border-blue-500/30 px-4 py-2 text-sm"
                    >
                      {company}
                    </Badge>
                  ))}
                  <Badge variant="secondary" className="bg-orange-900/30 text-orange-300 border-orange-500/30 px-4 py-2 text-sm">
                    — and others across 5 continents
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contracts Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="contracts"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('contracts') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Contracts Used in Petroleum Deals
              </h2>
              <p className="text-xl text-white/80 max-w-4xl mx-auto mb-4">
                Whether the broker is an individual or a company, PetroDealHub offers access to essential and protective legal templates:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map((contract, index) => (
                <motion.div
                  key={index}
                  id={`contract-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`contract-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <p className="text-white/80 text-sm font-medium">{contract}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="contract-note"
              data-animate
              className={`mt-12 bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 transform transition-all duration-1000 delay-1000 ${
                visibleElements.has('contract-note') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80">
                  These tools help you legally protect your mediation role and guarantee your commission as a broker, through internationally accepted mechanisms.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Platform Responsibility */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="responsibility"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('responsibility') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Platform Responsibility & Legal Ethics
              </h2>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                id="ethics-1"
                data-animate
                className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-red-500/20 shadow-lg transform transition-all duration-1000 delay-400 ${
                  visibleElements.has('ethics-1') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <Lock className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80 leading-relaxed">
                  PetroDealHub does not act as buyer, seller, or guarantor. We are a secure technology platform that supports professionals with tools, documentation, and verified data. All legal responsibility lies with the parties executing the deal.
                </p>
              </motion.div>

              <motion.div
                id="ethics-2"
                data-animate
                className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-amber-500/20 shadow-lg transform transition-all duration-1000 delay-600 ${
                  visibleElements.has('ethics-2') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <FileText className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80 leading-relaxed">
                  Contracts and documents made available through the platform are designed for commercial operations and advisory, not for enforcement unless reviewed and signed by all parties with legal counsel.
                </p>
              </motion.div>
            </div>
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
                Start Your Broker Journey Today
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join a global elite of petroleum brokers and mediators.
              </p>
              <p className="text-lg text-white/70 mb-12">
                Subscribe, apply, and activate your professional identity inside PetroDealHub.<br />
                Your next oil deal might be just one click away.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Apply for Certification
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Learn More
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