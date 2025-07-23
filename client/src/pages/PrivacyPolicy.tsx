import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Database, 
  Eye, 
  Share2, 
  Lock, 
  UserCheck, 
  Cookie, 
  Globe, 
  Link, 
  Baby, 
  Settings, 
  AlertTriangle, 
  CreditCard, 
  Edit, 
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info
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

export default function PrivacyPolicy() {
  const visibleElements = useScrollAnimation();

  const privacySection = [
    {
      icon: AlertTriangle,
      title: "1. Disclaimer of Liability",
      content: "PetroDealHub is a technology platform designed to assist professionals in the petroleum trade. While it offers access to information, tools, and digital services (including subscription-based content), we do not guarantee the accuracy, availability, legality, or reliability of any refinery, tanker, trade document, or offer displayed or shared via the platform.",
      note: "All subscriptions and services are provided \"AS IS\" and \"AS AVAILABLE\" with no warranties of any kind. PetroDealHub does not accept liability for any losses, damages, or misunderstandings arising from the use of the platform, paid or unpaid features, or any decisions users make based on platform content. The platform may display real, semi-real, or AI-generated data for educational, analytical, or professional simulation purposes. Users are fully responsible for verifying any information before acting on it.",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: Database,
      title: "2. Information We Collect",
      content: "We may collect and process the following types of personal and business-related information:",
      items: [
        "Account Information: Full name, company name, email address, phone number, country, and user credentials.",
        "Business Data: Deal-related information, uploaded documents (e.g., LOI, B/L, SPA), company registration details.",
        "Device Information: IP address, browser type, operating system, and access time.",
        "Usage Data: Page visits, clicks, session duration, and actions within the platform.",
        "Location Data (if applicable): For vessel tracking and refinery identification."
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Eye,
      title: "3. How We Use Your Information",
      content: "We use the information we collect to:",
      items: [
        "Operate and maintain the PetroDealHub platform.",
        "Facilitate secure oil trade deals between users (brokers, buyers, sellers, refineries).",
        "Provide real-time tanker tracking and refinery insights.",
        "Generate and store petroleum trade documentation.",
        "Communicate with users (e.g., notifications, platform updates).",
        "Analyze and improve platform performance and user experience.",
        "Comply with applicable laws and prevent fraudulent activities."
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Share2,
      title: "4. Sharing and Disclosure",
      content: "We do not sell or rent your personal data. However, we may share your information in the following cases:",
      items: [
        "With trusted partners who provide services essential to platform operation.",
        "When required by law, court order, or governmental request.",
        "In business transfers, such as a merger or acquisition.",
        "With your explicit consent, for specific business engagements."
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Lock,
      title: "5. Data Security",
      content: "We implement industry-standard security measures (SSL, encryption, secure authentication) to protect your data. However, no system is 100% secure, and users are responsible for keeping their login credentials safe.",
      color: "from-gray-600 to-gray-700"
    },
    {
      icon: UserCheck,
      title: "6. Your Rights and Choices",
      content: "You have the right to:",
      items: [
        "Access, update, or delete your account information.",
        "Request a copy of your stored data.",
        "Opt out of marketing communications.",
        "Object or restrict certain types of processing."
      ],
      note: "To exercise your rights, contact us at: privacy@petrodealhub.com",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Cookie,
      title: "7. Cookies and Tracking Technologies",
      content: "We use cookies and similar technologies to enhance platform performance and understand usage patterns. You can manage cookie preferences through your browser settings.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "8. International Users and Data Transfers",
      content: "PetroDealHub may be accessed globally. By using the platform, you agree to transfer your data to our secure servers, even if located outside your country of residence.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: Link,
      title: "9. Third-Party Links",
      content: "The platform may contain links to third-party websites or tools (e.g., Google Maps). PetroDealHub is not responsible for their privacy practices. We recommend reading their policies.",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Baby,
      title: "10. Children's Privacy",
      content: "PetroDealHub is not intended for users under the age of 18. We do not knowingly collect personal data from minors.",
      color: "from-pink-500 to-purple-500"
    },
    {
      icon: Settings,
      title: "11. No Guarantee of Service or Continuity",
      content: "We reserve the right to modify, suspend, limit, or discontinue any feature, service, or subscription at any time without prior notice.",
      color: "from-slate-500 to-gray-600"
    },
    {
      icon: Shield,
      title: "12. No Intermediary Role or Endorsement",
      content: "PetroDealHub is not a broker, buyer, or seller, and does not guarantee or endorse any transaction, offer, or communication between users. All interactions are at users' own risk.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: CreditCard,
      title: "13. Refunds and Disputes",
      content: "All subscription fees are non-refundable, unless otherwise agreed in writing. Subscribing does not guarantee access to real deals, valid offers, or verified parties.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: Edit,
      title: "14. Changes to This Policy",
      content: "We may update this policy at any time. Any changes are effective immediately upon posting. Continued use of the platform means acceptance of those changes.",
      color: "from-blue-600 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentPage="privacy-policy" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-green-900"></div>
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
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Effective Date: July 19, 2025
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Welcome to PetroDealHub. This Privacy Policy explains how we collect, use, and protect your personal information when you access or use our platform.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Info className="h-6 w-6 text-green-300" />
                <p className="text-lg text-white/90 font-semibold">
                  Important Notice
                </p>
              </div>
              <p className="text-lg text-white/90 leading-relaxed">
                By continuing to use our services, you agree to this policy in full.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {privacySection.map((section, index) => (
              <motion.div
                key={section.title}
                id={`privacy-section-${index}`}
                data-animate
                initial={{ opacity: 0, y: 30 }}
                animate={visibleElements.has(`privacy-section-${index}`) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-green-200 transition-colors">
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
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 mt-1 text-amber-400 flex-shrink-0" />
                          <p className="text-white/70 text-sm leading-relaxed font-medium">
                            <strong className="text-white">Important:</strong> {section.note}
                          </p>
                        </div>
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
      <section className="py-24 px-4 bg-gradient-to-r from-green-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            id="contact-section"
            data-animate
            initial={{ opacity: 0, y: 30 }}
            animate={visibleElements.has('contact-section') ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <Mail className="h-4 w-4 mr-2" />
              Privacy Contact
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              15. Contact Us
            </h2>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-12">
              <div className="text-center">
                <Mail className="h-12 w-12 text-green-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">
                  PetroDealHub Legal
                </h3>
                <p className="text-white/70 mb-6">
                  If you have any questions or concerns regarding this Privacy Policy, please contact:
                </p>
                <a 
                  href="mailto:legal@petrodealhub.com" 
                  className="text-green-300 hover:text-green-200 transition-colors text-xl font-medium inline-flex items-center gap-2"
                >
                  <Mail className="h-5 w-5" />
                  legal@petrodealhub.com
                </a>
              </div>
            </div>

            <p className="text-lg text-green-200 font-medium">
              PetroDealHub – Protecting Your Privacy in Global Oil Trade.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}