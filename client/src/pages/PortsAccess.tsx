import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Anchor, 
  Ship, 
  MapPin, 
  BarChart3, 
  Globe, 
  Settings,
  CheckCircle,
  TrendingUp,
  Database,
  Users,
  AlertTriangle,
  Building2,
  Navigation,
  ChevronRight,
  Waves,
  Target,
  Shield,
  Search,
  Eye,
  Link
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

export default function PortsAccess() {
  const visibleElements = useScrollAnimation();

  const features = [
    {
      title: "Full Port Profiles",
      description: "Explore port infrastructure, cargo handling capacity, berth specifications, customs protocols, and operational zones.",
      icon: <Building2 className="h-8 w-8 text-blue-400" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Tanker Activity Insights",
      description: "Real-time and recent data on vessel arrivals, departures, berthing schedules, and linked cargo manifests.",
      icon: <Ship className="h-8 w-8 text-green-400" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Refinery-Port Connectivity",
      description: "See which ports are directly tied to nearby refineries and how their pipelines or transport routes function.",
      icon: <Link className="h-8 w-8 text-purple-400" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Shipment Flow Intelligence",
      description: "Discover which products are moving in and out of ports, including quantities, destination markets, and deal links when available.",
      icon: <BarChart3 className="h-8 w-8 text-orange-400" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Contact Gateways",
      description: "Commercial contacts at select ports for cargo validation and logistical collaboration.",
      icon: <Users className="h-8 w-8 text-indigo-400" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Global Port Intelligence",
      description: "Visual and searchable interface across hundreds of active petroleum ports.",
      icon: <Search className="h-8 w-8 text-teal-400" />,
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const keyPorts = [
    {
      name: "Houston & Galveston",
      country: "USA",
      icon: <Anchor className="h-6 w-6 text-blue-400" />,
      region: "North America"
    },
    {
      name: "Rotterdam",
      country: "Netherlands",
      icon: <Anchor className="h-6 w-6 text-green-400" />,
      region: "Europe"
    },
    {
      name: "Fujairah",
      country: "UAE",
      icon: <Anchor className="h-6 w-6 text-purple-400" />,
      region: "Middle East"
    },
    {
      name: "Ras Tanura",
      country: "Saudi Arabia",
      icon: <Anchor className="h-6 w-6 text-orange-400" />,
      region: "Middle East"
    },
    {
      name: "Sikka & Mumbai",
      country: "India",
      icon: <Anchor className="h-6 w-6 text-indigo-400" />,
      region: "Asia"
    },
    {
      name: "Singapore",
      country: "Singapore",
      icon: <Anchor className="h-6 w-6 text-teal-400" />,
      region: "Southeast Asia"
    },
    {
      name: "Suez & Alexandria",
      country: "Egypt",
      icon: <Anchor className="h-6 w-6 text-amber-400" />,
      region: "Africa"
    },
    {
      name: "Santos",
      country: "Brazil",
      icon: <Anchor className="h-6 w-6 text-emerald-400" />,
      region: "South America"
    },
    {
      name: "Antwerp",
      country: "Belgium",
      icon: <Anchor className="h-6 w-6 text-rose-400" />,
      region: "Europe"
    },
    {
      name: "Durban",
      country: "South Africa",
      icon: <Anchor className="h-6 w-6 text-violet-400" />,
      region: "Africa"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="ports-access" />
      
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
                Strategic Maritime Intelligence
              </Badge>
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-6">
                <Waves className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Ports – Strategic Access Points
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                for Global Petroleum Trade
              </p>
              <p className="text-lg text-white/70 max-w-5xl mx-auto leading-relaxed mb-8">
                <span className="text-orange-400 font-semibold">Unlock Global Trade Gateways with PetroDealHub</span>
              </p>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed">
                PetroDealHub offers an advanced and commercial-grade Ports section that provides full visibility into the most critical maritime gateways in the global petroleum supply chain. Our Ports coverage enables you to understand, track, and engage with worldwide oil terminals, shipping routes, berth operations, and refinery-linked port facilities — all in one place.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="value-prop"
              data-animate
              className={`text-center bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-orange-500/20 shadow-xl transform transition-all duration-1000 delay-200 ${
                visibleElements.has('value-prop') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Target className="h-12 w-12 text-orange-400 mx-auto mb-6" />
              <p className="text-xl text-white/80 leading-relaxed">
                Whether you're managing a shipment, closing a deal, or planning vessel logistics, our data-rich interface provides a competitive advantage across the petroleum trade ecosystem.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What You Get Section */}
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
                What You Get in Our Ports Section
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

        {/* Key Petroleum Ports */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="ports-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('ports-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Key Petroleum Ports Featured in PetroDealHub
              </h2>
              <p className="text-xl text-white/80 max-w-4xl mx-auto mb-8">
                Our platform includes strategic intelligence on vital petroleum hubs worldwide, including but not limited to:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {keyPorts.map((port, index) => (
                <motion.div
                  key={index}
                  id={`port-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`port-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-lg">
                        {port.icon}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-white mb-1">{port.name}</h3>
                        <p className="text-blue-300 text-sm mb-1">{port.country}</p>
                        <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                          {port.region}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              id="global-map"
              data-animate
              className={`mt-16 text-center bg-gradient-to-r from-blue-900/30 to-teal-900/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 transform transition-all duration-1000 delay-800 ${
                visibleElements.has('global-map') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Globe className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Global Petroleum Logistics Map
              </h3>
              <p className="text-xl text-white/80 leading-relaxed">
                From East Asia to North America and from the Gulf to West Africa — our Ports section represents{' '}
                <span className="text-orange-400 font-semibold">a global petroleum logistics map built for action</span>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Subscription Access */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="subscription"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('subscription') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Exclusively Available to Subscribers
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
                    The Ports section is accessible to verified users through subscription tiers. It is designed for professionals in oil trading, vessel operations, port services, and strategic procurement who require direct access to port-related shipment intelligence.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Disclaimer */}
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
                  Port data is aggregated from shipping signals, terminal inputs, and public databases. It is intended for commercial navigation, planning, and insights — not as legal or operational confirmation. PetroDealHub is not liable for shipping discrepancies, port delays, or customs outcomes.
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
                Access Smarter Port Logistics
              </h2>
              <p className="text-xl text-white/80 mb-4">
                Trade with confidence.
              </p>
              <p className="text-lg text-white/70 mb-12">
                Subscribe to PetroDealHub.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Explore Ports Intelligence
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  View Subscription Plans
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