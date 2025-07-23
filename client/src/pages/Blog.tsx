import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, FileText, TrendingUp, Users, Mail, Lightbulb, BarChart3, Ship, Target } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from 'wouter';
import { useEffect, useRef, useState } from 'react';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleElements(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return visibleElements;
};

export default function Blog() {
  const visibleElements = useScrollAnimation();
  
  const sampleArticles = [
    {
      title: "The Rise of Digital Oil Brokerage: How Smart Platforms Are Replacing Old Models",
      description: "Explore how PetroDealHub and similar technologies are changing the broker's role forever.",
      icon: TrendingUp
    },
    {
      title: "Tanker-to-Refinery Deals: How to Verify Real-World Shipment Paths",
      description: "Understand the key documents and digital tools to validate that a tanker is truly en route to a legitimate refinery.",
      icon: Ship
    },
    {
      title: "LOI vs FCO: What Makes a Legitimate First Offer in Oil Trade?",
      description: "We break down the documentation logic and how buyers should issue intent the right way.",
      icon: FileText
    },
    {
      title: "Insider's View: Why Many Oil Deals Fail Before They Start",
      description: "A detailed guide on the missteps brokers make — and how PetroDealHub simplifies and secures the early steps of a transaction.",
      icon: Target
    },
    {
      title: "The Future of Trade Intelligence in Oil Logistics",
      description: "Learn how big data, blockchain, and smart APIs are creating real-time visibility for cargo, documents, and compliance.",
      icon: BarChart3
    }
  ];

  const whyMatters = [
    {
      title: "Industry Intelligence",
      description: "Stay ahead with insights into market trends, global price shifts, refinery movements, and regulatory updates.",
      icon: TrendingUp
    },
    {
      title: "Deal Strategy",
      description: "Learn how top brokers structure offers, negotiate terms, and validate documents across regions.",
      icon: Target
    },
    {
      title: "Platform How-To Guides",
      description: "Deep dives into using PetroDealHub's features — from uploading a deal to reviewing a vessel's route.",
      icon: BookOpen
    },
    {
      title: "Expert Commentary",
      description: "Articles from seasoned professionals with real experience in crude, refined products, tankers, port operations, and risk management.",
      icon: Users
    },
    {
      title: "AI, TradeTech & Petroleum",
      description: "How smart platforms are reshaping legacy trading workflows.",
      icon: Lightbulb
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="blog" />
      
      {/* Custom CSS for scroll animations */}
      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .scroll-animate.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        .stagger-5 { transition-delay: 0.5s; }
        
        .fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .slide-in-left {
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s ease-out;
        }
        
        .slide-in-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .slide-in-right {
          opacity: 0;
          transform: translateX(50px);
          transition: all 0.8s ease-out;
        }
        
        .slide-in-right.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .scale-in {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.6s ease-out;
        }
        
        .scale-in.visible {
          opacity: 1;
          transform: scale(1);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Main Content */}
      <div className="pt-40">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-950 via-[#003366] to-slate-900">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,111,0,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,51,102,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_70%)]"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMHYxaC0xVjBoMXptMCA1OXYxaC0xdi0xaDF6TTEgMHYxSDB2LTFIMXM2MCAwaDB2NjBIMHYtMWgxVjBoNTl2NTlIMXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L2c+PC9zdmc+')] opacity-30"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-orange-500/30 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-orange-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-orange-600/40 rounded-full animate-bounce"></div>
          <div className="absolute bottom-40 right-10 w-1 h-1 bg-orange-300/50 rounded-full animate-ping"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge 
                id="hero-badge"
                variant="outline" 
                className={`mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 px-4 py-2 scroll-animate ${visibleElements.has('hero-badge') ? 'visible' : ''} scale-in`}
              >
                📰 Blog – Insights That Fuel Global Oil Trade
              </Badge>
              <h1 
                id="hero-title"
                className={`text-4xl md:text-6xl font-bold mb-8 text-white scroll-animate ${visibleElements.has('hero-title') ? 'visible' : ''} stagger-1`}
              >
                Expert Articles. Real-World Value. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 float-animation">PetroDealHub Perspective.</span>
              </h1>
              <p 
                id="hero-desc1"
                className={`text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('hero-desc1') ? 'visible' : ''} stagger-2`}
              >
                At PetroDealHub, we believe that knowledge is as powerful as the deal itself.
                Our Blog is not just a space for content — it's a strategic resource center built to empower brokers, traders, refinery managers, and energy professionals with insights that matter.
              </p>
              <p 
                id="hero-desc2"
                className={`text-lg text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('hero-desc2') ? 'visible' : ''} stagger-3`}
              >
                From the intricate world of oil documentation to the evolving global tanker routes — every article is written to bridge experience, data, and decision-making.
              </p>
            </div>
          </div>
        </section>

        {/* Why Our Blog Matters Section */}
        <section className="py-24 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge 
                  id="why-badge"
                  variant="outline" 
                  className={`mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30 scroll-animate ${visibleElements.has('why-badge') ? 'visible' : ''} scale-in`}
                >
                  ✨ Why Our Blog Matters
                </Badge>
                <h2 
                  id="why-title"
                  className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('why-title') ? 'visible' : ''} stagger-1`}
                >
                  Strategic Resource Center
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {whyMatters.map((item, index) => {
                  const IconComponent = item.icon;
                  const cardId = `why-card-${index}`;
                  return (
                    <Card 
                      key={index} 
                      id={cardId}
                      className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group h-full scroll-animate ${visibleElements.has(cardId) ? 'visible' : ''} stagger-${(index % 5) + 1}`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5 text-orange-400" />
                          </div>
                          <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                        </div>
                        <CardDescription className="text-white/70 leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Sample Article Topics Section */}
        <section className="py-24 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge 
                  id="articles-badge"
                  variant="outline" 
                  className={`mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30 scroll-animate ${visibleElements.has('articles-badge') ? 'visible' : ''} scale-in`}
                >
                  🧭 Sample Article Topics
                </Badge>
                <h2 
                  id="articles-title"
                  className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('articles-title') ? 'visible' : ''} stagger-1`}
                >
                  Expert Insights & Analysis
                </h2>
              </div>

              <div className="grid gap-6">
                {sampleArticles.map((article, index) => {
                  const IconComponent = article.icon;
                  const articleId = `article-${index}`;
                  const animationClass = index % 2 === 0 ? 'slide-in-left' : 'slide-in-right';
                  return (
                    <Card 
                      key={index} 
                      id={articleId}
                      className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group scroll-animate ${animationClass} ${visibleElements.has(articleId) ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform mt-1">
                            <IconComponent className="h-6 w-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-300 transition-colors">
                              📌 {article.title}
                            </h3>
                            <p className="text-white/70 leading-relaxed">
                              {article.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Global Focus Section */}
        <section className="py-24 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge 
                id="global-badge"
                variant="outline" 
                className={`mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 scroll-animate ${visibleElements.has('global-badge') ? 'visible' : ''} scale-in`}
              >
                🌍 Global Focus. Local Relevance.
              </Badge>
              <h2 
                id="global-title"
                className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('global-title') ? 'visible' : ''} stagger-1`}
              >
                Every Region Where Oil Moves
              </h2>
              <p 
                id="global-desc"
                className={`text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('global-desc') ? 'visible' : ''} stagger-2`}
              >
                Our content reflects every region where oil moves — from the Americas and Europe, to the Middle East, Asia, and Africa. Whether you're closing a deal in Texas or verifying documents from Singapore, our insights translate across borders.
              </p>
              
              <div 
                id="global-regions"
                className={`flex flex-wrap justify-center gap-4 mb-8 scroll-animate ${visibleElements.has('global-regions') ? 'visible' : ''} stagger-3`}
              >
                {['Americas', 'Europe', 'Middle East', 'Asia', 'Africa'].map((region, index) => (
                  <div 
                    key={region}
                    className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Globe className="h-5 w-5 text-orange-400 float-animation" />
                    <span className="text-white font-medium">{region}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contribute Section */}
        <section className="py-24 bg-[#003366] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_40%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge 
                id="contribute-badge"
                variant="outline" 
                className={`mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 scroll-animate ${visibleElements.has('contribute-badge') ? 'visible' : ''} scale-in`}
              >
                ✍ Want to Contribute?
              </Badge>
              <h2 
                id="contribute-title"
                className={`text-3xl md:text-4xl font-bold mb-6 text-white scroll-animate ${visibleElements.has('contribute-title') ? 'visible' : ''} stagger-1`}
              >
                Share Your Industry Experience
              </h2>
              <p 
                id="contribute-desc"
                className={`text-white/80 text-lg mb-8 max-w-3xl mx-auto leading-relaxed scroll-animate ${visibleElements.has('contribute-desc') ? 'visible' : ''} stagger-2`}
              >
                We welcome articles from professionals in the industry.
                Submit a piece and let your experience become part of the global conversation.
              </p>
              
              <div 
                id="contribute-email"
                className={`bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 mb-8 scroll-animate ${visibleElements.has('contribute-email') ? 'visible' : ''} stagger-3 hover:bg-slate-800/70 transition-all duration-300`}
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-orange-400 float-animation" />
                  <span className="text-white font-medium">Submit your articles to:</span>
                </div>
                <a 
                  href="mailto:blog@petrodealhub.com" 
                  className="text-orange-400 hover:text-orange-300 font-bold text-xl transition-colors hover:scale-105 inline-block"
                >
                  blog@petrodealhub.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final Message Section */}
        <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div 
                id="final-message"
                className={`bg-slate-800/30 rounded-3xl p-12 border border-orange-500/20 backdrop-blur-sm scroll-animate ${visibleElements.has('final-message') ? 'visible' : ''} scale-in hover:bg-slate-800/40 transition-all duration-500`}
              >
                <h2 
                  id="final-title"
                  className={`text-3xl md:text-4xl font-bold mb-8 text-white scroll-animate ${visibleElements.has('final-title') ? 'visible' : ''} stagger-1`}
                >
                  PetroDealHub Blog –
                </h2>
                <div className="space-y-4 text-xl text-white/80 leading-relaxed">
                  <p 
                    id="final-line1"
                    className={`scroll-animate ${visibleElements.has('final-line1') ? 'visible' : ''} stagger-2`}
                  >
                    Where Trading Meets Insight.
                  </p>
                  <p 
                    id="final-line2"
                    className={`scroll-animate ${visibleElements.has('final-line2') ? 'visible' : ''} stagger-3`}
                  >
                    Where Documents Meet Strategy.
                  </p>
                  <p 
                    id="final-line3"
                    className={`text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-bold float-animation scroll-animate ${visibleElements.has('final-line3') ? 'visible' : ''} stagger-4`}
                  >
                    Where Oil Moves Smarter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}