import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Mail, Globe, Ship, TrendingUp, Users, MapPin, Rocket, Briefcase, GraduationCap, FileText } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Careers() {

  const benefits = [
    {
      icon: Globe,
      title: "Global Impact",
      description: "Contribute to projects that influence trade flows, fuel infrastructure, and economic resilience worldwide."
    },
    {
      icon: Ship,
      title: "Real-World Trade",
      description: "Collaborate with brokers, refineries, and shipping agents on live workflows and real trade scenarios."
    },
    {
      icon: TrendingUp,
      title: "High-Performance Culture",
      description: "Thrive in a data-driven environment where innovation, precision, and speed matter."
    },
    {
      icon: Users,
      title: "Trusted Network",
      description: "Join a community of professionals shaping the digital future of oil logistics and commercial intelligence."
    },
    {
      icon: MapPin,
      title: "Remote & Hybrid Roles",
      description: "Our team spans multiple continents, with flexible work models to support productivity and well-being."
    }
  ];

  const roles = [
    {
      title: "Senior Oil Trade Analyst",
      location: "Remote",
      type: "Full-time",
      category: "Analytics"
    },
    {
      title: "Refinery Account Manager (Gulf & MENA)",
      location: "Dubai / Remote",
      type: "Full-time",
      category: "Business Development"
    },
    {
      title: "Platform Product Manager – Maritime Tools",
      location: "US or Europe",
      type: "Full-time",
      category: "Product"
    },
    {
      title: "Head of Broker Partnerships",
      location: "Flexible",
      type: "Leadership",
      category: "Partnerships"
    },
    {
      title: "Contract Specialist – Oil & Commodities",
      location: "Remote",
      type: "Full-time",
      category: "Legal"
    }
  ];

  const skills = [
    "Oil trading and brokering",
    "Refinery operations and downstream strategy", 
    "Tanker logistics and marine traffic coordination",
    "Business development in energy markets",
    "Digital trade infrastructure (product, tech, UX)",
    "Legal and compliance in petroleum contracts",
    "Research & market intelligence (energy economics, OPEC trends)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="careers" />

      {/* Main Content */}
      <div className="pt-40">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-40 overflow-hidden bg-gradient-to-br from-slate-950 via-[#003366] to-slate-900">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,111,0,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,51,102,0.15),transparent_60%)]"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-orange-500/30 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-orange-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-orange-600/40 rounded-full animate-bounce"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30 px-4 py-2">
                Careers at PetroDealHub
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white">
                Shape the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Global Oil Trade</span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
                At PetroDealHub, we don't just build platforms — we build the tools that power petroleum trade across continents. We're redefining how brokers, refineries, and shipping operators connect, communicate, and close deals.
              </p>
              <p className="text-lg text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                As a U.S.-based global platform, we combine technological innovation, trade insight, and operational intelligence to drive value for our partners and users. And we're always on the lookout for bold minds ready to lead the next phase of our growth.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Global Platform</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Remote-First</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Rocket className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-medium">Innovation-Driven</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Work With Us Section */}
        <section className="py-24 bg-gradient-to-br from-[#003366] via-[#004080] to-[#003366] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,111,0,0.1),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <Badge variant="outline" className="mb-6 bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30 px-6 py-3 text-lg">
                  Why Work With Us?
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Join the Energy Revolution
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/30 hover:border-orange-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:to-slate-900/80 transition-all duration-500 group backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-orange-500/10">
                    <CardHeader className="pb-6">
                      <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl inline-flex mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                        <benefit.icon className="h-7 w-7 text-orange-400" />
                      </div>
                      <CardTitle className="text-white text-xl font-bold mb-3">{benefit.title}</CardTitle>
                      <CardDescription className="text-white/80 leading-relaxed">
                        {benefit.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who We're Looking For Section */}
        <section className="py-24 bg-slate-900/80 backdrop-blur-sm relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                  Who We're Looking For
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  We Hire Globally
                </h2>
                <p className="text-white/70 text-lg max-w-3xl mx-auto">
                  If you have expertise in the following fields, we want to hear from you:
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 hover:bg-slate-800/60 transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-5 w-5 text-orange-400" />
                      </div>
                      <span className="text-white font-medium">{skill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Current Openings Section */}
        <section className="py-24 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-300 border-orange-500/30">
                  Current Openings
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Join Our Team
                </h2>
              </div>

              <div className="grid gap-6">
                {roles.map((role, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <Briefcase className="h-5 w-5 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{role.title}</h3>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Badge variant="outline" className="bg-slate-700/50 text-white border-slate-600">
                              {role.location}
                            </Badge>
                            <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                              {role.type}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                              {role.category}
                            </Badge>
                          </div>
                        </div>
                        <a 
                          href={`mailto:careers@petrodealhub.com?subject=Application for ${role.title}&body=Dear PetroDealHub Team,%0D%0A%0D%0AI am interested in applying for the ${role.title} position located in ${role.location}.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0ABest regards`}
                          className="inline-block"
                        >
                          <Button className="bg-orange-500 hover:bg-orange-600 text-white group-hover:scale-105 transition-transform">
                            Apply Now
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-[#003366] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.05),transparent_40%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 bg-orange-500/10 text-orange-300 border-orange-500/30">
                Ready to Join?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Work Where Oil Meets Opportunity
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                Whether you're a seasoned broker, a trade lawyer, or a digital product thinker — if you're ready to work at the intersection of energy, commerce, and technology, PetroDealHub is the place for you.
              </p>
              
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-orange-400" />
                  <span className="text-white font-medium">Send your resume and cover letter to:</span>
                </div>
                <a 
                  href="mailto:careers@petrodealhub.com" 
                  className="text-orange-400 hover:text-orange-300 font-bold text-xl transition-colors"
                >
                  careers@petrodealhub.com
                </a>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-2">
                  🚀 Let's move the barrels. Let's build the future. Together.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}