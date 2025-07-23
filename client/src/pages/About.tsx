import { useState, useEffect } from "react";
import { 
  Globe, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Zap, 
  CheckCircle,
  Building2,
  Ship,
  MapPin,
  BarChart3,
  FileText,
  BookOpen,
  Handshake,
  Eye,
  Lock,
  Lightbulb,
  ArrowUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function About() {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Intersection Observer for animations
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
          setIsVisible(prev => ({ ...prev, [index]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Scroll to Top Button */}
      {scrolled && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 bg-orange-500 hover:bg-orange-600 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,111,0,0.1),transparent_40%)] animate-pulse duration-3000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,111,0,0.05),transparent_40%)] animate-pulse duration-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/20 rounded-full animate-bounce duration-3000"></div>
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-500/30 rounded-full animate-bounce duration-4000 delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-orange-300/25 rounded-full animate-bounce duration-5000 delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-1000 ease-out" 
               style={{ opacity: isVisible[0] ? 1 : 0, transform: isVisible[0] ? 'translateY(0)' : 'translateY(32px)' }}>
            <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 px-4 py-2 animate-pulse">
              About PetroDealHub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">
              Where Oil Trade Meets Intelligence, 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 animate-gradient bg-300% bg-gradient-to-r"> Transparency</span>, 
              and Global Precision
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              At PetroDealHub, we are not just a platform — we are a movement redefining how the world approaches oil trading, deal visibility, and transactional trust.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Globe className="h-5 w-5 text-orange-400 animate-pulse" />
                <span className="text-white font-medium">Global Platform</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 delay-100">
                <Shield className="h-5 w-5 text-orange-400 animate-pulse" />
                <span className="text-white font-medium">Secure & Transparent</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 delay-200">
                <TrendingUp className="h-5 w-5 text-orange-400 animate-pulse" />
                <span className="text-white font-medium">First of Its Kind</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-[#003366] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,111,0,0.05),transparent_40%)] animate-pulse duration-6000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-1000 ease-out delay-300"
                 style={{ opacity: isVisible[1] ? 1 : 0, transform: isVisible[1] ? 'translateY(0)' : 'translateY(32px)' }}>
              <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20 transition-all duration-300">
                Our Mission
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Empowering Global Oil Trade Intelligence
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mission Item 1 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '200ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BarChart3 className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Track & Validate</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Track, verify, and validate every stage of the petroleum deal cycle with complete transparency
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 2 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '400ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Eye className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Full Visibility</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Ensure full visibility and transparency over shipments, documents, offers, and pricing
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 3 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '600ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Real-time Intelligence</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Provide real-time data intelligence on refineries, vessels, and trade dynamics
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 4 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '800ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Lock className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Secure Environment</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Offer secure environments for negotiating and managing deals with complete protection
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 5 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '1000ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Shield className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Risk Protection</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Help users protect capital, minimize risk, and close verified deals with confidence
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Mission Item 6 */}
              <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible[2] ? 1 : 0, transform: isVisible[2] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '1200ms' }}>
                <CardHeader>
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <CheckCircle className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-white group-hover:text-orange-300 transition-colors duration-300">Verified Deals</CardTitle>
                  <CardDescription className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Ensure all transactions are verified, authentic, and backed by reliable documentation
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Built for Global Standards */}
      <section className="py-20 bg-[#002244] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,111,0,0.03),transparent_50%)] animate-pulse duration-8000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-1000 ease-out"
                 style={{ opacity: isVisible[3] ? 1 : 0, transform: isVisible[3] ? 'translateY(0)' : 'translateY(32px)' }}>
              <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20 transition-all duration-300">
                Global Standards
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                A Platform Built for Global Standards
              </h2>
              <p className="text-white/70 text-lg max-w-3xl mx-auto">
                PetroDealHub serves as a comprehensive commercial interface for professionals across the petroleum industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Industry 1 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                   style={{ opacity: isVisible[4] ? 1 : 0, transform: isVisible[4] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '100ms' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-all duration-300 hover:scale-110 hover:rotate-6">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white hover:text-orange-300 transition-colors duration-300">Crude & Refined Trading</h3>
                </div>
                <p className="text-white/70 hover:text-white/90 transition-colors duration-300">Advanced tools for crude oil and refined petroleum product trading operations</p>
              </div>

              {/* Industry 2 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
                   style={{ opacity: isVisible[4] ? 1 : 0, transform: isVisible[4] ? 'translateY(0)' : 'translateY(32px)', transitionDelay: '200ms' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-all duration-300 hover:scale-110 hover:rotate-6">
                    <Ship className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white hover:text-orange-300 transition-colors duration-300">Marine Shipping & Logistics</h3>
                </div>
                <p className="text-white/70 hover:text-white/90 transition-colors duration-300">Comprehensive vessel tracking and maritime logistics management solutions</p>
              </div>

              {/* Industry 3 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Building2 className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Refinery Deal Desks</h3>
                </div>
                <p className="text-white/70">Specialized tools for refinery operations and deal desk management</p>
              </div>

              {/* Industry 4 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Compliance & Documentation</h3>
                </div>
                <p className="text-white/70">Automated compliance management and document processing systems</p>
              </div>

              {/* Industry 5 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Globe className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">National Oil Companies</h3>
                </div>
                <p className="text-white/70">Enterprise solutions for national oil companies and government institutions</p>
              </div>

              {/* Industry 6 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Energy Institutions</h3>
                </div>
                <p className="text-white/70">Comprehensive platforms for energy-focused financial and trading institutions</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/80 text-lg font-medium">
                Our systems are built on structured data layers, secure pipelines, verified business logic, and a user experience crafted for real traders and decision-makers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Support Section */}
      <section className="py-20 bg-[#003366]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
              Training & Support
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Training. Support. Empowerment.
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              We believe knowledge drives precision. That's why PetroDealHub offers continuous onboarding, guidance, and training modules for our subscribers. Whether you're an emerging broker or a seasoned refinery executive, you'll always know what's next, what's required, and what's real in your deal pipeline.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Continuous Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Ongoing training modules and educational resources for all skill levels</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Expert Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Professional support from industry experts and trading specialists</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader className="text-center">
                  <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mx-auto mb-4">
                    <Lightbulb className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-white">Smart Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">Intelligent onboarding process tailored to your experience and role</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Clarity Section */}
      <section className="py-20 bg-[#002244]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                Trust & Protection
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Trust, Clarity, and Deal Protection
              </h2>
              <p className="text-white/70 text-lg max-w-3xl mx-auto">
                At the heart of PetroDealHub is a commitment to transparency. We help companies operate with confidence and security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Trust Point 1 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Avoid Misinformation</h3>
                  <p className="text-white/70">Eliminate unreliable middlemen and access verified, authentic market data</p>
                </div>
              </div>

              {/* Trust Point 2 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Eye className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Complete Visibility</h3>
                  <p className="text-white/70">Maintain deal visibility from Day 1 to final delivery with real-time tracking</p>
                </div>
              </div>

              {/* Trust Point 3 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Clear Legal Structures</h3>
                  <p className="text-white/70">Operate with transparent legal frameworks and honest pricing mechanisms</p>
                </div>
              </div>

              {/* Trust Point 4 */}
              <div className="flex gap-4 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="p-3 bg-orange-500/20 rounded-lg shrink-0">
                  <Handshake className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Preserve Trust & Security</h3>
                  <p className="text-white/70">Maintain client trust, financial security, and operational integrity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Scale Section */}
      <section className="py-20 bg-[#003366]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
              Global Vision
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Driven by Vision. Designed for Scale.
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Our team spans multiple countries and time zones, combining deep oil & gas expertise with scalable digital architecture. Whether you're in Houston, Dubai, Rotterdam, or Singapore — PetroDealHub speaks your language.
            </p>
            <p className="text-white/80 text-xl font-medium mb-8">
              We are building the future of petroleum trading — one deal, one tanker, one secure connection at a time.
            </p>

            {/* Global Presence */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Houston</h4>
                <p className="text-white/60 text-sm">Americas Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Dubai</h4>
                <p className="text-white/60 text-sm">Middle East Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Rotterdam</h4>
                <p className="text-white/60 text-sm">Europe Hub</p>
              </div>
              <div className="text-center">
                <div className="p-4 bg-orange-500/20 rounded-xl inline-flex mb-3">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-white font-semibold">Singapore</h4>
                <p className="text-white/60 text-sm">Asia Pacific Hub</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              🌐 PetroDealHub — The Global Oil Trade Platform
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Precision. Protection. Power.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Award className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Precision</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Protection</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
                <Zap className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Power</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <section className="py-12 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-1000 ease-out"
               style={{ opacity: isVisible[5] ? 1 : 0, transform: isVisible[5] ? 'translateY(0)' : 'translateY(32px)' }}>
            <h3 className="text-2xl font-bold text-white mb-6">Ready to Transform Your Oil Trading Experience?</h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust PetroDealHub for their petroleum trading and logistics needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 animate-pulse-glow"
              >
                Get Started Today
              </Button>
              <Button 
                onClick={() => window.location.href = '/vessels'}
                variant="outline"
                className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Explore Platform
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}