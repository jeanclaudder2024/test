import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Globe, FileText, TrendingUp, Users, Mail, Lightbulb, BarChart3, Ship, Target } from 'lucide-react';
import Header from "@/components/Header";
import { Link } from 'wouter';

export default function Blog() {
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
              <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 px-4 py-2">
                📰 Blog – Insights That Fuel Global Oil Trade
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">
                Expert Articles. Real-World Value. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">PetroDealHub Perspective.</span>
              </h1>
              <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                At PetroDealHub, we believe that knowledge is as powerful as the deal itself.
                Our Blog is not just a space for content — it's a strategic resource center built to empower brokers, traders, refinery managers, and energy professionals with insights that matter.
              </p>
              <p className="text-lg text-white/60 mb-8 max-w-3xl mx-auto leading-relaxed">
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
                <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                  ✨ Why Our Blog Matters
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Strategic Resource Center
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {whyMatters.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Card key={index} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group h-full">
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
                <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                  🧭 Sample Article Topics
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Expert Insights & Analysis
                </h2>
              </div>

              <div className="grid gap-6">
                {sampleArticles.map((article, index) => {
                  const IconComponent = article.icon;
                  return (
                    <Card key={index} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
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
              <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30">
                🌍 Global Focus. Local Relevance.
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Every Region Where Oil Moves
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                Our content reflects every region where oil moves — from the Americas and Europe, to the Middle East, Asia, and Africa. Whether you're closing a deal in Texas or verifying documents from Singapore, our insights translate across borders.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Americas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Europe</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Middle East</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Asia</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Africa</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute Section */}
        <section className="py-24 bg-[#003366] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_40%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30">
                ✍ Want to Contribute?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Share Your Industry Experience
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                We welcome articles from professionals in the industry.
                Submit a piece and let your experience become part of the global conversation.
              </p>
              
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-orange-400" />
                  <span className="text-white font-medium">Submit your articles to:</span>
                </div>
                <a 
                  href="mailto:blog@petrodealhub.com" 
                  className="text-orange-400 hover:text-orange-300 font-bold text-xl transition-colors"
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
              <div className="bg-slate-800/30 rounded-3xl p-12 border border-orange-500/20 backdrop-blur-sm">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
                  PetroDealHub Blog –
                </h2>
                <div className="space-y-4 text-xl text-white/80 leading-relaxed">
                  <p>Where Trading Meets Insight.</p>
                  <p>Where Documents Meet Strategy.</p>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 font-bold">
                    Where Oil Moves Smarter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-white font-bold text-xl">PetroDealHub</span>
                </div>
                <p className="text-white/70 mb-6">
                  The leading platform for global petroleum trade intelligence and vessel tracking.
                </p>
                <div className="flex gap-4">
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-orange-500">
                      Home
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-orange-500">
                      About
                    </Button>
                  </Link>
                  <Link href="/vessels">
                    <Button variant="ghost" size="sm" className="text-white/80 hover:text-orange-500">
                      Vessels
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/vessels" className="text-white/70 hover:text-orange-500 transition-colors">Vessels</Link></li>
                  <li><Link href="/refineries" className="text-white/70 hover:text-orange-500 transition-colors">Refineries</Link></li>
                  <li><Link href="/ports" className="text-white/70 hover:text-orange-500 transition-colors">Ports</Link></li>
                  <li><Link href="/dashboard" className="text-white/70 hover:text-orange-500 transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-white/70 hover:text-orange-500 transition-colors">About Us</Link></li>
                  <li><Link href="/careers" className="text-white/70 hover:text-orange-500 transition-colors">Careers</Link></li>
                  <li><Link href="/blog" className="text-white/70 hover:text-orange-500 transition-colors">Blog</Link></li>
                  <li><a href="mailto:blog@petrodealhub.com" className="text-white/70 hover:text-orange-500 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-12 pt-8 text-center">
              <p className="text-white/60">
                © 2025 PetroDealHub. All rights reserved. | Global Petroleum Trade Intelligence Platform
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}