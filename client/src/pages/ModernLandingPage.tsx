import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { 
  ChevronRight, 
  Play,
  MapPin,
  Ship,
  Factory,
  Building2,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Award,
  ArrowRight
} from "lucide-react";

// Advanced Animation Components
const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-float opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${4 + Math.random() * 3}s`
        }}
      >
        <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
      </div>
    ))}
  </div>
);

const StatCounter = ({ end, label, suffix = "", prefix = "" }: {
  end: number;
  label: string;
  suffix?: string;
  prefix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= end) {
          clearInterval(timer);
          return end;
        }
        return prev + Math.ceil(end / 100);
      });
    }, 30);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
        {prefix}{Math.round(count).toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

const IndustryShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const showcaseData = [
    {
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
      title: "Advanced Oil Refineries",
      description: "State-of-the-art petroleum processing facilities",
      category: "Refineries",
      stats: "500+ Global Facilities",
      icon: Factory
    },
    {
      url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
      title: "VLCC Oil Tankers",
      description: "Very Large Crude Carriers transporting worldwide",
      category: "Vessels",
      stats: "2,400+ Active Fleet",
      icon: Ship
    },
    {
      url: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop",
      title: "Strategic Oil Terminals",
      description: "Critical infrastructure for global distribution",
      category: "Ports",
      stats: "150+ Major Terminals",
      icon: Building2
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-96 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm bg-slate-900/20">
      {showcaseData.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img 
              src={item.url} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 backdrop-blur-sm px-3 py-1">
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.category}
                </Badge>
                <div className="text-sm text-orange-400 font-semibold bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  {item.stats}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-slate-300">{item.description}</p>
            </div>
          </div>
        );
      })}
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {showcaseData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-orange-500 w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}) => (
  <Card 
    className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-orange-500/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardContent className="p-8 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default function ModernLandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <FloatingElements />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slideInLeft">
              <Badge className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 text-orange-300 border border-orange-500/30 px-6 py-2 text-sm font-semibold backdrop-blur-sm">
                🚢 Next-Generation Oil Trading Platform
              </Badge>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-orange-200 bg-clip-text text-transparent leading-tight">
                  Advanced Maritime Oil Brokerage
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                  Revolutionary platform connecting global oil traders with cutting-edge vessel tracking, 
                  real-time market intelligence, and comprehensive port management solutions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button className="group bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                    Launch Platform
                    <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="outline" className="group border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105">
                  Watch Demo
                  <Play className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <StatCounter end={2400} label="Active Vessels" suffix="+" />
                <StatCounter end={150} label="Global Ports" suffix="+" />
                <StatCounter end={500} label="Refineries" suffix="+" />
              </div>
            </div>

            {/* Right Content */}
            <div className="animate-slideInRight">
              <IndustryShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Revolutionary Features
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Powered by cutting-edge technology and real-world maritime expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Ship}
              title="Real-Time Vessel Tracking"
              description="Monitor global oil vessel movements with precision GPS tracking and predictive routing analytics."
              delay={0}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Market Intelligence"
              description="Access comprehensive market data, pricing trends, and trading opportunities in real-time."
              delay={200}
            />
            <FeatureCard
              icon={Globe}
              title="Global Port Network"
              description="Connect with 150+ major oil terminals and refineries across all continents."
              delay={400}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="Bank-grade encryption and multi-layer security protocols protect your sensitive data."
              delay={600}
            />
            <FeatureCard
              icon={Zap}
              title="Instant Transactions"
              description="Execute trades and manage contracts with lightning-fast processing and automated workflows."
              delay={800}
            />
            <FeatureCard
              icon={Award}
              title="Industry Leading"
              description="Trusted by Fortune 500 companies and leading oil trading firms worldwide."
              delay={1000}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent">
              Ready to Transform Your Oil Trading Operations?
            </h2>
            <p className="text-xl text-slate-300">
              Join thousands of professionals already using our platform to revolutionize maritime oil brokerage.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/dashboard">
                <Button className="group bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-2xl shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}