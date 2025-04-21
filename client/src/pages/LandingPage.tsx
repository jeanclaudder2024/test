import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Anchor, BarChart3, Globe, Shield, Zap, Ship, Navigation, Radar, Waves, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/60 fixed w-full z-50"
      >
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="bg-primary p-2 rounded-full shadow-lg shadow-primary/20"
          >
            <Ship className="h-6 w-6 text-white" />
          </motion.div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Vesselian
          </motion.span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 500 }}>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 500 }}>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 500 }}>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 500 }}>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </Link>
          </motion.div>
        </nav>
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/auth">
              <Button variant="outline" size="sm" className="rounded-full">
                Log In
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/auth">
              <Button size="sm" className="rounded-full shadow-md shadow-primary/30">
                Get Started
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="w-full min-h-screen grid md:grid-cols-2 relative overflow-hidden">
        {/* Left side - Dark hero with vessel image */}
        <div className="bg-black text-white py-24 md:py-12 lg:py-16 relative">
          <motion.div 
            className="absolute inset-0 opacity-60"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1561361398-a957b93dbf35?q=80&w=1000&auto=format&fit=crop" 
              alt="Oil vessel at night" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          
          {/* Floating 3D ship icon */}
          <motion.div
            className="absolute top-20 right-20 opacity-40 hidden lg:block"
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Ship className="w-40 h-40 text-primary/80" />
          </motion.div>
          
          <div className="px-8 md:px-16 flex flex-col justify-center h-full relative z-10 max-w-xl mx-auto md:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                >
                  Track Your Fleet
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  in Real-Time.
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  Optimize Your Ship Operations.
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.4 }}
            >
              Manage up to 10 ships with live location tracking, fuel monitoring, and trip management.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg shadow-primary/30">
                  Get Started Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Right side - Feature highlight */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-24 md:py-12 lg:py-16 relative">
          {/* Animated wave pattern */}
          <div className="absolute bottom-0 w-full opacity-10">
            <motion.div
              animate={{ 
                x: [0, -100, 0],
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "linear" 
              }}
            >
              <svg viewBox="0 0 1200 120" className="w-[400%] h-20">
                <path 
                  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                  opacity=".25" 
                  className="fill-primary"
                />
                <path 
                  d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
                  opacity=".5" 
                  className="fill-primary"
                />
                <path 
                  d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
                  className="fill-primary"
                />
              </svg>
            </motion.div>
          </div>
          
          <div className="px-8 md:px-16 flex flex-col justify-center h-full relative z-10 max-w-xl mx-auto md:mx-0">
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="flex items-center mb-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mr-4"
                >
                  <Compass className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Empowering Ship Owners & Drivers
                </h2>
              </div>
              <p className="text-gray-700 mb-8">
                At Vesselian, we believe in making ship management simple, efficient, and data-driven. Our mission is to empower ship owners and drivers with real-time tracking, fuel monitoring, and comprehensive fleet management.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="#features">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-full px-6 shadow-sm">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 mr-4"
                >
                  <Navigation className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Simple Steps to Manage Your Fleet
                </h2>
              </div>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-primary/10 rounded-full p-3 mr-4 shadow-inner shadow-primary/5">
                    <span className="text-primary font-bold text-lg">01</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Sign Up and Add Your Ships</h3>
                    <p className="text-gray-700">Create an account and register your ships in the app.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-primary/10 rounded-full p-3 mr-4 shadow-inner shadow-primary/5">
                    <span className="text-primary font-bold text-lg">02</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Track in Real-Time</h3>
                    <p className="text-gray-700">Monitor location, status and performance of your vessels.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  whileHover={{ x: 5 }}
                >
                  <div className="bg-primary/10 rounded-full p-3 mr-4 shadow-inner shadow-primary/5">
                    <span className="text-primary font-bold text-lg">03</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Optimize Operations</h3>
                    <p className="text-gray-700">Use insights to improve efficiency and reduce costs.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="space-y-2 max-w-[58rem]">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Powerful Maritime Intelligence
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">
                Our platform combines real-time tracking with advanced analytics to provide comprehensive maritime intelligence
              </p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Globe className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">Global Vessel Tracking</CardTitle>
                    <CardDescription className="text-base">
                      Real-time monitoring of over 22,000 vessels worldwide with detailed position data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Interactive world map visualization</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Detailed vessel information</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Historical route tracking</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <BarChart3 className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                    <CardDescription className="text-base">
                      Powerful data analysis tools for making informed business decisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Predictive route analytics</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Cargo volume reporting</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Market trend visualization</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">AI-Powered Assistant</CardTitle>
                    <CardDescription className="text-base">
                      Intelligent maritime insights and automated document generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Natural language vessel queries</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Automated document generation</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Market intelligence reports</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Shield className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">Elite Membership</CardTitle>
                    <CardDescription className="text-base">
                      Premium features for oil brokers and industry professionals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Direct messaging with carriers</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Tender bidding tools</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Advanced cargo analytics</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Radar className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">Real-Time Alerts</CardTitle>
                    <CardDescription className="text-base">
                      Instant notifications about vessel status and route changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Customizable alert thresholds</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Email and push notifications</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Critical event monitoring</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <motion.div 
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 w-fit mb-4 shadow-lg shadow-primary/20"
                      whileHover={{ rotate: 10, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Waves className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl">Weather Integration</CardTitle>
                    <CardDescription className="text-base">
                      Marine weather forecasts and sea condition monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Real-time weather overlays</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>7-day marine forecasts</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 700 }}
                      >
                        <div className="bg-primary/10 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>Storm and hazard warnings</span>
                      </motion.li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Choose Your Plan
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[46rem] mx-auto">
                Select the plan that best fits your business needs
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Basic Plan */}
            <Card className="flex flex-col border shadow-sm">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>Essential tracking for small operations</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$99</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Access to global vessel tracking</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Basic analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Standard document templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Email support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="flex flex-col relative border shadow-sm overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                Popular
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Advanced features for growing businesses</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$199</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Advanced analytics and reporting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>AI-powered document generation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Historical data (up to 12 months)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Priority email & phone support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Elite Plan */}
            <Card className="flex flex-col border shadow-sm bg-gradient-to-b from-muted/50 to-background">
              <CardHeader>
                <CardTitle>Elite</CardTitle>
                <CardDescription>Premium features for industry professionals</CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$399</span>
                  <span className="ml-1 text-sm text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Elite broker dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Direct messaging with carriers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Tender bidding tools</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Custom API access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-primary mt-1" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Maritime Operations?
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[46rem] mx-auto">
                Join thousands of shipping professionals who trust AsiStream for their maritime intelligence needs
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-[176px] mt-6">
              <Link href="/auth">
                <Button size="lg">
                  Start Free Trial
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <Anchor className="h-6 w-6" />
                <span>AsiStream</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The next generation of maritime intelligence
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>Documentation</li>
                <li>Blog</li>
                <li>Case Studies</li>
                <li>Support</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              © 2025 AsiStream. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}