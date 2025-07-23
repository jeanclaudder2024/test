import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { 
  Ship, 
  MapPin, 
  Eye, 
  Globe, 
  Clock,
  CheckCircle,
  Target,
  Building2,
  Users,
  TrendingUp,
  ChevronRight,
  Mail,
  Shield,
  BarChart3,
  Navigation,
  Anchor,
  Factory,
  FileText,
  AlertCircle,
  Zap,
  Lock,
  Radio,
  Container,
  Activity
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

export default function VesselsTracking() {
  const visibleElements = useScrollAnimation();
  const { isAuthenticated } = useAuth();

  const trackingFeatures = [
    {
      title: "Live Vessel Data",
      description: "Real-time AIS tracking integrated with global maritime sources.",
      icon: <Radio className="h-8 w-8 text-blue-400" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Port-to-Port Route Monitoring",
      description: "Know where the vessel is coming from and where it's going — from origin terminal to destination refinery.",
      icon: <Navigation className="h-8 w-8 text-green-400" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Cargo Details",
      description: "Access insights about the type of petroleum product, estimated quantity, and storage method.",
      icon: <Container className="h-8 w-8 text-purple-400" />,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Refinery Matching",
      description: "See which refinery is linked to the tanker, if available.",
      icon: <Factory className="h-8 w-8 text-orange-400" />,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Deal Reference",
      description: "Link vessels to ongoing or historical deals within the platform (if authorized by user).",
      icon: <FileText className="h-8 w-8 text-indigo-400" />,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Ownership & Operator Info",
      description: "Learn which company owns or manages the ship, and whether it's under contract or available.",
      icon: <Users className="h-8 w-8 text-teal-400" />,
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "ETA & Transit Status",
      description: "Track estimated arrival times and live positioning on the map.",
      icon: <Clock className="h-8 w-8 text-amber-400" />,
      color: "from-amber-500 to-yellow-500"
    },
    {
      title: "Compliance Markers",
      description: "Highlight tankers that match international safety, documentation, or inspection standards.",
      icon: <Shield className="h-8 w-8 text-emerald-400" />,
      color: "from-emerald-500 to-green-500"
    }
  ];

  const professionalBenefits = [
    {
      title: "For Brokers",
      description: "Verify that a seller's tanker actually exists, is active, and is heading toward a legitimate port or refinery.",
      icon: <Users className="h-8 w-8 text-blue-400" />
    },
    {
      title: "For Buyers",
      description: "Track your shipment in real time and stay updated on delays, route changes, or potential issues.",
      icon: <Target className="h-8 w-8 text-green-400" />
    },
    {
      title: "For Refineries",
      description: "Coordinate incoming deliveries with confidence. Manage berth availability, storage, and inspection readiness.",
      icon: <Factory className="h-8 w-8 text-purple-400" />
    },
    {
      title: "For Traders & Analysts",
      description: "Gain strategic insights into market movement and supply flow patterns worldwide.",
      icon: <BarChart3 className="h-8 w-8 text-orange-400" />
    }
  ];

  const keyFeatures = [
    { feature: "Vessel Name & IMO", description: "Unique identifier for every ship" },
    { feature: "Cargo Type", description: "Crude, diesel, jet fuel, LPG, etc." },
    { feature: "Route Map", description: "Origin & destination with live tracking" },
    { feature: "Linked Refinery", description: "When disclosed by the shipper" },
    { feature: "Deal Context", description: "Tied to PetroDealHub offers (optional)" },
    { feature: "Global Coverage", description: "Includes tankers in Americas, Europe, Asia, Africa, and the Middle East" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="vessels-tracking" />
      
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
                Real-Time Maritime Intelligence
              </Badge>
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-6">
                <Ship className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Vessels – Real-Time Tracking
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                of Global Oil Shipments
              </p>
              <div className="space-y-4 mb-8">
                <p className="text-lg text-blue-400 font-semibold max-w-3xl mx-auto">
                  Total Visibility. Verified Data. Smarter Petroleum Deals.
                </p>
              </div>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed mb-8">
                At PetroDealHub, we understand that every successful oil trade depends on trust, timing, and transparency. That's why our platform offers a dedicated Vessels Section designed to help brokers, buyers, refiners, and logistic managers gain real-time visibility into the movement of oil tankers, product carriers, and cargo vessels across the globe.
              </p>
              <p className="text-lg text-white/70 max-w-6xl mx-auto leading-relaxed">
                <span className="text-orange-400 font-semibold">This isn't just tracking — this is deal intelligence in motion.</span>
              </p>
            </motion.div>
          </div>
        </section>

        {/* What Our Vessel Tracking Offers */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="tracking-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('tracking-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Vessel Tracking Offers
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trackingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  id={`tracking-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`tracking-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 75}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl">
                          {feature.icon}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed flex-grow">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why It Matters for Petroleum Professionals */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              id="professionals-header"
              data-animate
              className={`text-center mb-16 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('professionals-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why It Matters for Petroleum Professionals
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {professionalBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  id={`benefit-${index}`}
                  data-animate
                  className={`transform transition-all duration-1000 ${
                    visibleElements.has(`benefit-${index}`) 
                      ? 'translate-y-0 opacity-100 scale-100' 
                      : 'translate-y-10 opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                        <p className="text-white/70 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features at a Glance */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
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
                Key Features at a Glance
              </h2>
            </motion.div>

            <div className="space-y-4">
              {keyFeatures.map((item, index) => (
                <motion.div
                  key={index}
                  id={`feature-item-${index}`}
                  data-animate
                  className={`flex items-center justify-between p-6 bg-slate-800/70 backdrop-blur-sm rounded-xl border border-green-500/20 shadow-lg transform transition-all duration-1000 ${
                    visibleElements.has(`feature-item-${index}`) 
                      ? 'translate-x-0 opacity-100' 
                      : index % 2 === 0 ? 'translate-x-10 opacity-0' : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <Activity className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.feature}</h3>
                    </div>
                  </div>
                  <div className="flex-grow mx-6">
                    <div className="border-t border-slate-600 border-dashed"></div>
                  </div>
                  <p className="text-white/70 text-right max-w-md">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Tracking. Confidential Deals. */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="verification-header"
              data-animate
              className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('verification-header') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Verified Tracking. Confidential Deals.
              </h2>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                id="verification-1"
                data-animate
                className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-blue-500/20 shadow-lg transform transition-all duration-1000 delay-400 ${
                  visibleElements.has('verification-1') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <Shield className="h-8 w-8 text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-white/80 text-lg leading-relaxed">
                  All tracking data is sourced from trusted marine intelligence providers and integrated securely into the PetroDealHub system.
                </p>
              </motion.div>

              <motion.div
                id="verification-2"
                data-animate
                className={`flex items-start space-x-4 p-6 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-amber-500/20 shadow-lg transform transition-all duration-1000 delay-600 ${
                  visibleElements.has('verification-2') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <Lock className="h-8 w-8 text-amber-400 mt-1 flex-shrink-0" />
                <p className="text-white/80 text-lg leading-relaxed">
                  While vessel movements are public by nature, deal-specific links or cargo confirmations are only visible to authorized users involved in the transaction.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Decision Power */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              id="decision-power"
              data-animate
              className={`text-center bg-gradient-to-r from-blue-900/30 to-teal-900/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 transform transition-all duration-1000 delay-200 ${
                visibleElements.has('decision-power') 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'
              }`}
            >
              <Zap className="h-16 w-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                This is Not Just Data. This is Decision Power.
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                From verifying a deal's legitimacy to planning a terminal delivery, our Vessels Section turns complex oil logistics into clear, actionable intelligence — and keeps you ahead in a competitive market.
              </p>
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
                Track with Confidence
              </h2>
              <p className="text-xl text-white/80 mb-4">
                Want to track a specific tanker?
              </p>
              <p className="text-xl text-white/80 mb-12">
                Or need to validate a seller's shipping claim?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href={isAuthenticated ? "/vessels" : "/login"}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Start Tracking Vessels
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href={isAuthenticated ? "/map" : "/login"}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    View Live Map
                  </Button>
                </Link>
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
                  Contact our Maritime Desk
                </h3>
                <div className="inline-flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm rounded-full px-8 py-4 border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Mail className="h-6 w-6 text-orange-400" />
                  <span className="text-lg font-semibold text-white">vessels@petrodealhub.com</span>
                </div>
              </motion.div>

              {/* Final Statement */}
              <motion.div
                id="final-statement"
                data-animate
                className={`mt-12 transform transition-all duration-1000 delay-800 ${
                  visibleElements.has('final-statement') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
              >
                <p className="text-2xl font-bold text-white mb-2">
                  PetroDealHub
                </p>
                <p className="text-lg text-orange-400 font-semibold">
                  Because Every Legit Deal Has a Legit Vessel Behind It.
                </p>
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