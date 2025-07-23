import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Shield, 
  Users, 
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Mail,
  Lock,
  Globe,
  Briefcase
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

export default function DocumentationCenter() {
  const visibleElements = useScrollAnimation();

  const documentCategories = [
    {
      title: "Letter of Intent (LOI)",
      description: "Expresses the buyer's or seller's intent to engage in a petroleum deal.",
      icon: <FileText className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Irrevocable Corporate Purchase Order (ICPO)",
      description: "Standard document issued by buyers to proceed with a defined deal offer.",
      icon: <Briefcase className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Full Corporate Offer (FCO)",
      description: "Detailed terms from the seller outlining product, pricing, quantity, and terms.",
      icon: <Globe className="h-6 w-6" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Sales & Purchase Agreement (SPA)",
      description: "Commercial agreement between parties; we offer standard frameworks.",
      icon: <CheckCircle className="h-6 w-6" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Bill of Lading (B/L)",
      description: "Template reflecting standard transport documentation linked to tankers or vessels.",
      icon: <Download className="h-6 w-6" />,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "SGS Inspection Certificate",
      description: "A placeholder format based on how cargo is typically inspected and certified.",
      icon: <Shield className="h-6 w-6" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Safety Data Sheet (SDS)",
      description: "Outlines petroleum product properties and safety handling references.",
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Port Receipts & Tank Entry Documents",
      description: "Includes basic templates that reflect industry practices in loading/unloading.",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-pink-500 to-rose-500"
    }
  ];

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Editable Templates",
      description: "Available in fully editable DOCX or PDF formats"
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" />,
      title: "Professional Formatting",
      description: "Professionally formatted for real-world oil deal environments"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
      title: "Industry Standards",
      description: "Structured based on common practices in international oil trade"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Customizable",
      description: "Intended for customization by involved parties based on their agreement"
    }
  ];

  const targetAudience = [
    {
      title: "Professional Brokers",
      description: "Working with new counterparties",
      icon: <Briefcase className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Refinery Managers",
      description: "Preparing structured offers",
      icon: <Globe className="h-6 w-6 text-green-500" />
    },
    {
      title: "Legal Teams",
      description: "Needing a starting framework for review",
      icon: <Shield className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Trading Firms",
      description: "Navigating international workflows",
      icon: <Users className="h-6 w-6 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="documentation" />
      
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
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full mb-6">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                📚 Documentation Center
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                Professional Resources to Empower Global Oil Transactions
              </p>
              <p className="text-lg text-white/70 max-w-5xl mx-auto leading-relaxed">
                At PetroDealHub, we understand that documentation lies at the core of every successful oil transaction. 
                Our platform offers a wide range of professionally structured templates and deal-oriented materials, 
                designed to help brokers, refineries, shipping agents, and traders operate with clarity and confidence 
                in complex international markets.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="notice"
              data-animate
              className={`transform transition-all duration-1000 delay-200 ${
                visibleElements.has('notice') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 border border-orange-500/20 shadow-xl">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-8 w-8 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Important Notice</h3>
                    <p className="text-white/80 leading-relaxed">
                      We don't act as a legal authority or certification body. Rather, PetroDealHub provides smart access 
                      to business-ready templates and documentation frameworks that reflect industry standards and common 
                      deal practices — always with full transparency that the platform does not bear legal responsibility 
                      for the final content of any document used outside the platform.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="offers"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-300 ${
                visibleElements.has('offers') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                📄 What Our Documentation Section Offers
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                ✅ Editable & Deal-Driven Templates
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`feature-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex flex-col items-center text-center">
                      {feature.icon}
                      <h3 className="text-lg font-bold text-white mt-4 mb-2">{feature.title}</h3>
                      <p className="text-white/70">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="help-text"
              data-animate
              className={`text-center bg-slate-800/50 rounded-2xl p-8 border border-orange-500/20 transform transition-all duration-1000 delay-800 ${
                visibleElements.has('help-text') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <p className="text-lg text-white/80">
                We help you accelerate deal preparation — but you remain responsible for validation, compliance, and signature finalization.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Document Categories */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="categories"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('categories') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                📘 Included Document Categories
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documentCategories.map((category, index) => (
                <motion.div
                  key={index}
                  id={`category-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`category-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                    <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{category.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{category.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="note"
              data-animate
              className={`mt-12 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 transform transition-all duration-1000 delay-1000 ${
                visibleElements.has('note') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/80">
                  <strong>📌 Note:</strong> All documentation files provided are for operational reference. 
                  They are not legally binding unless reviewed, completed, and signed by authorized entities.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why We Provide These Documents */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="why"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('why') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                🧭 Why We Provide These Documents
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                "To accelerate deal readiness for brokers and intermediaries",
                "To enhance transparency and avoid common delays due to document misalignment",
                "To support onboarding of new traders, companies, and partners into the petroleum trading process",
                "To streamline communication between tankers, refineries, and buyers"
              ].map((reason, index) => (
                <motion.div
                  key={index}
                  id={`reason-${index}`}
                  data-animate
                  className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 shadow-lg transform transition-all duration-1000 ${
                    visibleElements.has(`reason-${index}`) 
                      ? 'translate-x-0 opacity-100' 
                      : index % 2 === 0 ? 'translate-x-10 opacity-0' : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-white/80 leading-relaxed">{reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Confidentiality & Usage Policy */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="policy"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('policy') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                🔐 Confidentiality & Usage Policy
              </h2>
            </motion.div>

            <div className="space-y-6">
              {[
                "PetroDealHub does not sign or execute any documents on behalf of users",
                "We do not guarantee legal enforceability of any template used off-platform",
                "We offer these templates as a service to assist and organize the deal process, not as legal counsel or official deal certification"
              ].map((policy, index) => (
                <motion.div
                  key={index}
                  id={`policy-${index}`}
                  data-animate
                  className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-red-500/20 shadow-lg transform transition-all duration-1000 ${
                    visibleElements.has(`policy-${index}`) 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <Lock className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-white/80 leading-relaxed">{policy}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="audience"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('audience') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                🧠 Who Is It For?
              </h2>
              <p className="text-xl text-white/80">Our documentation resources are best suited for:</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {targetAudience.map((audience, index) => (
                <motion.div
                  key={index}
                  id={`audience-${index}`}
                  data-animate
                  className={`text-center p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform ${
                    visibleElements.has(`audience-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl mb-4">
                    {audience.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{audience.title}</h3>
                  <p className="text-white/70">{audience.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Customization Support */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              id="support"
              data-animate
              className={`transform transition-all duration-1000 delay-200 ${
                visibleElements.has('support') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                💬 Customization Support Available
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto">
                Do you need help tailoring a document to a specific transaction or jurisdiction?
              </p>
              <p className="text-lg text-white/70 mb-8 max-w-4xl mx-auto">
                Our team can guide you to the right format, or help you request professional assistance 
                through our extended partner network.
              </p>
              
              <div className="inline-flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm rounded-full px-8 py-4 border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <Mail className="h-6 w-6 text-orange-400" />
                <span className="text-lg font-semibold text-white">Contact: documentation@petrodealhub.com</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              id="closing"
              data-animate
              className={`transform transition-all duration-1000 delay-200 ${
                visibleElements.has('closing') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                PetroDealHub – We Don't Just Power Deals. We Support Every Step of Them.
              </h3>
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