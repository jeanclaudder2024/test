import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Factory, 
  Database, 
  BarChart3, 
  Globe, 
  Settings,
  CheckCircle,
  TrendingUp,
  MapPin,
  Users,
  AlertTriangle,
  Building2,
  Mail,
  ChevronRight,
  Target,
  Shield,
  Search,
  Eye,
  Link,
  Container,
  Fuel,
  Activity,
  Ship,
  Phone
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

export default function RefineriesAccess() {
  const visibleElements = useScrollAnimation();

  const features = [
    {
      title: "Production Capacity",
      description: "View current and historical throughput by fuel type (crude, diesel, jet fuel, etc.).",
      icon: <BarChart3 className="h-8 w-8 text-blue-400" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Tank & Storage Info",
      description: "Access storage capacity, tank types, and availability when shared.",
      icon: <Container className="h-8 w-8 text-green-400" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Product Inventory Status",
      description: "Get real-time or recent estimates of product types stored or refined.",
      icon: <Fuel className="h-8 w-8 text-purple-400" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Port & Berth Integration",
      description: "Know which ports and berths are linked to each refinery and how to connect.",
      icon: <Link className="h-8 w-8 text-orange-400" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Vessel Connectivity",
      description: "Match refinery ports to incoming or outgoing tankers visible on our vessel map.",
      icon: <Ship className="h-8 w-8 text-indigo-400" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Ownership & Operator Data",
      description: "See who operates and owns the refinery and whether it is active in deal flows.",
      icon: <Users className="h-8 w-8 text-teal-400" />,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "Refinery-Level Contact Gateways",
      description: "Verified contact points (when available) to streamline deal confirmation.",
      icon: <Phone className="h-8 w-8 text-amber-400" />,
      color: "from-amber-500 to-yellow-500"
    }
  ];

  const globalRefineries = [
    {
      name: "Rotterdam Refinery",
      country: "Netherlands",
      icon: <Factory className="h-6 w-6 text-blue-400" />,
      region: "Europe"
    },
    {
      name: "Port Arthur & Galveston",
      country: "USA",
      icon: <Factory className="h-6 w-6 text-green-400" />,
      region: "North America"
    },
    {
      name: "Jamnagar Refinery",
      country: "India",
      icon: <Factory className="h-6 w-6 text-purple-400" />,
      region: "Asia"
    },
    {
      name: "Ras Tanura & Jazan",
      country: "Saudi Arabia",
      icon: <Factory className="h-6 w-6 text-orange-400" />,
      region: "Middle East"
    },
    {
      name: "Ruwais",
      country: "UAE",
      icon: <Factory className="h-6 w-6 text-indigo-400" />,
      region: "Middle East"
    },
    {
      name: "Singapore Refining Company",
      country: "Singapore",
      icon: <Factory className="h-6 w-6 text-teal-400" />,
      region: "Southeast Asia"
    },
    {
      name: "Sidi Kerir & Alexandria",
      country: "Egypt",
      icon: <Factory className="h-6 w-6 text-amber-400" />,
      region: "Africa"
    },
    {
      name: "Abidjan",
      country: "Ivory Coast",
      icon: <Factory className="h-6 w-6 text-emerald-400" />,
      region: "Africa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="refineries-access" />
      
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
                Global Infrastructure Intelligence
              </Badge>
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mb-6">
                <Factory className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Refineries – Global Intelligence
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                for Oil Infrastructure
              </p>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-orange-400 font-semibold max-w-3xl mx-auto">
                  Unmatched Access. Verified Insight. Smarter Oil Trade.
                </p>
              </div>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed mb-8">
                At PetroDealHub, we deliver comprehensive refinery intelligence — transforming static infrastructure data into dynamic deal-making tools. Our platform provides unparalleled access to one of the largest global refinery databases, enabling petroleum professionals to trace, validate, and engage with oil infrastructure like never before.
              </p>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed">
                Whether you're a broker verifying a deal, a trader tracking delivery points, or a company assessing storage and shipment capacities — our Refineries section empowers you with the information you need.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Our Refineries Section Provides */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="features-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('features-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Refineries Section Provides
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl">
                          {feature.icon}
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-400" />
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

        {/* Global Map of Refineries */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="global-map-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('global-map-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                A Global Map of Refineries — at Your Fingertips
              </h2>
              <p className="text-xl text-white/80 max-w-4xl mx-auto mb-8">
                PetroDealHub features intelligence on hundreds of refineries, including the most strategic and active ones in the world:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {globalRefineries.map((refinery, index) => (
                <motion.div
                  key={index}
                  id={`refinery-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`refinery-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg">
                        {refinery.icon}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white mb-1">{refinery.name}</h3>
                        <p className="text-red-300 text-sm mb-1">{refinery.country}</p>
                        <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                          {refinery.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="more-refineries"
              data-animate
              className={`mt-12 text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 transform transition-all duration-1000 delay-800 ${
                visibleElements.has('more-refineries') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <p className="text-white/80 text-lg">
                Many more across Europe, Latin America, East Asia, and the Middle East
              </p>
            </motion.div>

            <motion.div
              id="database-advantage"
              data-animate
              className={`mt-16 text-center bg-gradient-to-r from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-3xl p-8 border border-orange-500/20 transform transition-all duration-1000 delay-1000 ${
                visibleElements.has('database-advantage') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Database className="h-16 w-16 text-orange-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Largest Operational Database Globally
              </h3>
              <p className="text-xl text-white/80 leading-relaxed">
                With PetroDealHub, you gain access to{' '}
                <span className="text-orange-400 font-semibold">the largest operational database of refineries globally</span>
                {' '}— empowering brokers and companies with refinery-specific visibility that no general logistics or port database can provide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Subscription-Based, Commercial-Grade */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="subscription-header"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('subscription-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Subscription-Based, Commercial-Grade
              </h2>
            </motion.div>

            <motion.div
              id="subscription-details"
              data-animate
              className={`bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20 shadow-xl transform transition-all duration-1000 delay-400 ${
                visibleElements.has('subscription-details') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    This service is available to verified members via subscription only. It's built for petroleum professionals — buyers, brokers, refiners, and logistics teams — who require real, actionable refinery context.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Important Disclaimer */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="disclaimer-header"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('disclaimer-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Important Disclaimer
              </h2>
            </motion.div>

            <motion.div
              id="disclaimer-content"
              data-animate
              className={`bg-amber-900/20 border border-amber-500/30 rounded-2xl p-8 transform transition-all duration-1000 delay-400 ${
                visibleElements.has('disclaimer-content') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-8 w-8 text-amber-400 mt-1 flex-shrink-0" />
                <p className="text-white/80 text-lg leading-relaxed">
                  PetroDealHub's refinery data is compiled from public maritime sources, terminal inputs, and commercial indicators. It is not a legal or official source. Data is provided to support commercial insight only and may include estimates, partial updates, or inferred links. Our platform does not claim official refinery authority, and is not legally responsible for the accuracy or use of third-party data.
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
                Experience Refinery Logistics as a Strategic Advantage
              </h2>
              <p className="text-xl text-white/80 mb-12">
                Join PetroDealHub.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Explore Refinery Intelligence
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Target className="h-5 w-5 mr-2" />
                  View Subscription Plans
                </Button>
              </div>

              {/* Contact Information */}
              <motion.div
                id="contact-info"
                data-animate
                className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 transform transition-all duration-1000 delay-600 ${
                  visibleElements.has('contact-info') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Contact our Refinery Desk
                </h3>
                <div className="inline-flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm rounded-full px-8 py-4 border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Mail className="h-6 w-6 text-orange-400" />
                  <span className="text-lg font-semibold text-white">refinery@petrodealhub.com</span>
                </div>
              </motion.div>
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