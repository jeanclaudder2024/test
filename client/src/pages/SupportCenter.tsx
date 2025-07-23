import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  BookOpen, 
  Settings, 
  Ticket, 
  Users, 
  Video, 
  Globe, 
  Shield, 
  Clock, 
  Mail,
  ChevronRight,
  FileText,
  Wrench,
  MessageSquare,
  HeadphonesIcon
} from 'lucide-react';

// Scroll animation hook
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

    // Observe all animated elements
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

export default function SupportCenter() {
  const visibleElements = useScrollAnimation();

  const supportFeatures = [
    {
      icon: HelpCircle,
      title: "Knowledge Base & FAQs",
      description: "Get instant answers to the most common questions about:",
      features: [
        "How to open a verified broker or dealer account",
        "Document handling and smart validation", 
        "Shipment and refinery tracking tools",
        "Deal progression, verification, and closure steps"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: BookOpen,
      title: "Step-by-Step Tutorials",
      description: "From sending your first offer to verifying a B/L or coordinating with a tanker — our guides break down every action into simple, visual steps tailored for every user level.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Technical Support & Incident Help",
      description: "Having issues with login, data sync, or offer submission? Our technical team is on standby to:",
      features: [
        "Diagnose platform-related errors",
        "Assist in data flow or document rendering",
        "Escalate complex issues directly to our engineering team"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Ticket,
      title: "Ticketing System (24/7)",
      description: "Submit support requests anytime via your dashboard. Each ticket is tracked, time-stamped, and managed by our global support workflow — so nothing falls through the cracks.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Dedicated Account Managers (Enterprise Tier)",
      description: "Our premium subscribers and enterprise partners receive one-on-one support from assigned account managers who understand your use case, deal volume, and integration needs.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Video,
      title: "Live Onboarding & Training",
      description: "New to PetroDealHub? Schedule a live onboarding session with our experts — tailored to your company's structure and market focus.",
      color: "from-teal-500 to-green-500"
    }
  ];

  const globalCoverageFeatures = [
    {
      icon: Clock,
      title: "Rapid multilingual support",
      description: "Support in multiple languages for global accessibility"
    },
    {
      icon: Shield,
      title: "Region-aware compliance assistance",
      description: "Local regulatory expertise for each trading region"
    },
    {
      icon: FileText,
      title: "Confidential handling of sensitive client and transaction data",
      description: "Enterprise-grade security for all communications"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentPage="support-center" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <HeadphonesIcon className="h-4 w-4 mr-2" />
              24/7 Global Support
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Support Center
              </span>
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-200 mb-6">
              Your Trusted Partner in Every Step of the Oil Deal Lifecycle
            </h2>
            
            <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              At PetroDealHub, we understand that time is critical, trust is non-negotiable, and support must be immediate and intelligent. That's why we offer a world-class Support Center designed for traders, brokers, refinery managers, and integration teams across the globe.
            </p>
            
            <p className="text-lg text-blue-200 mb-12">
              Whether you're managing your first deal or integrating our platform into your enterprise systems — we're here, every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Ecosystem Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            id="support-ecosystem"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('support-ecosystem') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Wrench className="h-4 w-4 mr-2" />
              Support Ecosystem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What You'll Find in Our Support Ecosystem
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                id={`support-feature-${index}`}
                data-animate
                initial={{ opacity: 0, y: 30 }}
                animate={visibleElements.has(`support-feature-${index}`) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-white/70 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                {feature.features && (
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-start text-white/60">
                        <ChevronRight className="h-4 w-4 mt-1 mr-2 text-blue-400 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Coverage Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-slate-800 to-blue-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            id="global-coverage"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('global-coverage') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              Global Operations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Global Coverage. Localized Response.
            </h2>
            <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              At PetroDealHub, we proudly serve companies and professionals across North America, Europe, Latin America, Asia, the Middle East, and Africa — covering every oil trading region in the world without exception.
            </p>
          </motion.div>

          <motion.div
            id="coverage-details"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('coverage-details') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12"
          >
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Whether you're closing a deal in Rotterdam, verifying cargo in Houston, or tracking a shipment in Singapore, our support operations are designed to respond with speed, clarity, and regional expertise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {globalCoverageFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  id={`coverage-feature-${index}`}
                  data-animate
                  initial={{ opacity: 0, y: 20 }}
                  animate={visibleElements.has(`coverage-feature-${index}`) ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            id="trust-section"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('trust-section') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Trust & Reliability
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              You're Never Alone in a Deal
            </h2>
            <p className="text-xl text-white/80 leading-relaxed">
              In an industry where timing, accuracy, and document precision can define millions in value — PetroDealHub ensures you're never alone. Our support teams bridge the gap between action and assurance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            id="contact-section"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('contact-section') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Mail className="h-4 w-4 mr-2" />
              Get Help Now
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Need Help?
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                  <a 
                    href="mailto:support@petrodealhub.com" 
                    className="text-blue-300 hover:text-blue-200 transition-colors text-lg font-medium"
                  >
                    support@petrodealhub.com
                  </a>
                </div>
                
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Dashboard Support</h3>
                  <p className="text-white/70">
                    Open a support ticket directly from your account dashboard
                  </p>
                </div>
              </div>
            </div>

            <p className="text-lg text-blue-200 font-medium">
              PetroDealHub – Precision Trade Support, Built for the Global Oil Market.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}