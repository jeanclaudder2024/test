import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Scale, 
  Users, 
  CreditCard, 
  Eye, 
  Edit, 
  XCircle, 
  Globe, 
  AlertTriangle,
  Mail,
  Calendar,
  CheckCircle
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

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

export default function TermsOfService() {
  const visibleElements = useScrollAnimation();

  const termsSection = [
    {
      icon: FileText,
      title: "1. Platform Purpose",
      content: "PetroDealHub offers services tailored to professionals operating in or exploring the petroleum trade market. These include:",
      items: [
        "Access to data related to refineries, tankers, shipments, and documentation.",
        "Smart formatting of business documents (e.g., LOI, B/L, SPA).",
        "Subscription features including custom deal flows, shipment trackers, and structured simulations.",
        "An integrated space for refining commercial presentation and positioning."
      ],
      note: "While PetroDealHub is designed for deal facilitation and business readiness, we do not act as a party to any actual transaction.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "2. User Eligibility",
      content: "To use PetroDealHub, you must be at least 18 years old and legally authorized to enter into business contracts.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "3. Use of Services",
      content: "You agree to use the platform in good faith and in compliance with applicable laws. You shall not:",
      items: [
        "Misrepresent your identity or business purpose.",
        "Violate the integrity of the platform or exploit it to harm others.",
        "Use any portion of the content to mislead third parties.",
        "Engage in illegal, misleading, or unethical practices."
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: CreditCard,
      title: "4. Subscriptions and Dealer Access",
      content: "Access to advanced tools and structured features is subject to subscription. These include but are not limited to:",
      items: [
        "Dealer-style profile creation and access",
        "Professionally formatted trade documents and reports",
        "Insight-based tanker/refinery dashboards",
        "Simulated and scenario-based deal modules"
      ],
      note: "Subscriptions are offered as professional enablement tools and do not constitute endorsement, guarantee, or confirmation of real-world deals. PetroDealHub reserves the right to add, modify, or discontinue any subscription feature at any time.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: AlertTriangle,
      title: "5. No Guarantees or Endorsements",
      content: "All content is provided with the intent to support decision-making, but we do not guarantee the truthfulness, legality, or validity of any scenario, listing, or data point.",
      note: "Users are solely responsible for verifying information before using it in real-world engagements.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: FileText,
      title: "6. Intellectual Property",
      content: "All platform elements are protected by copyright, trademark, and international IP laws. You may not reuse, clone, or rebrand any part of the system.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Eye,
      title: "7. Privacy and Data",
      content: "Your data is collected and processed in line with our Privacy Policy. Continued use of the platform implies agreement with that policy.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: Edit,
      title: "8. Modifications",
      content: "We may update these Terms at our discretion. All changes will take effect once published.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: XCircle,
      title: "9. Termination",
      content: "We may suspend or terminate any account if it violates our Terms or disrupts the platform's operations.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "10. Governing Law",
      content: "These Terms shall be governed by and interpreted in accordance with the laws of the State of Delaware, United States.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Scale,
      title: "11. Limitation of Liability",
      content: "Under no circumstance shall PetroDealHub be held liable for indirect, consequential, or incidental damages arising from your use of the platform or its services.",
      color: "from-gray-500 to-slate-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentPage="terms-of-service" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-purple-900"></div>
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
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Effective Date: July 19, 2025
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Welcome to PetroDealHub, the premier platform for petroleum trade support, insight, and professional enablement. These Terms of Service ("Terms") govern your use of our platform and services.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 max-w-4xl mx-auto">
              <p className="text-lg text-white/90 leading-relaxed">
                By accessing or using any part of the platform, you agree to be bound by these Terms. PetroDealHub is a registered trademark operated under a United States-based company. The platform is developed to provide high-level tools, trade documentation, and access modules that help users present themselves as active participants, dealers, or brokers in the global oil trade sector.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {termsSection.map((section, index) => (
              <motion.div
                key={section.title}
                id={`terms-section-${index}`}
                data-animate
                initial={{ opacity: 0, y: 30 }}
                animate={visibleElements.has(`terms-section-${index}`) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-purple-200 transition-colors">
                      {section.title}
                    </h3>
                    
                    <p className="text-white/80 mb-6 leading-relaxed text-lg">
                      {section.content}
                    </p>
                    
                    {section.items && (
                      <ul className="space-y-3 mb-6">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start text-white/70">
                            <CheckCircle className="h-5 w-5 mt-1 mr-3 text-green-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {section.note && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/70 text-sm leading-relaxed font-medium">
                          <strong className="text-white">Note:</strong> {section.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-purple-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            id="contact-section"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('contact-section') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Mail className="h-4 w-4 mr-2" />
              Legal Contact
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              12. Contact
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12">
              <div className="text-center">
                <Mail className="h-12 w-12 text-purple-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">
                  PetroDealHub Legal Department
                </h3>
                <p className="text-white/70 mb-6">
                  Legal inquiries should be directed to:
                </p>
                <a 
                  href="mailto:legal@petrodealhub.com" 
                  className="text-purple-300 hover:text-purple-200 transition-colors text-xl font-medium inline-flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  legal@petrodealhub.com
                </a>
              </div>
            </div>

            <p className="text-lg text-purple-200 font-medium">
              PetroDealHub – Professional Terms for Global Oil Trade Excellence.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}