import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronRight, Anchor, BarChart3, Globe, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>Vesselian</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm">
              Get Started
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full min-h-screen grid md:grid-cols-2 relative overflow-hidden">
        {/* Left side - Dark hero with vessel image */}
        <div className="bg-black text-white py-24 md:py-12 lg:py-16 relative">
          <div className="absolute inset-0 opacity-60">
            <img 
              src="https://images.unsplash.com/photo-1561361398-a957b93dbf35?q=80&w=1000&auto=format&fit=crop" 
              alt="Oil vessel at night" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="px-8 md:px-16 flex flex-col justify-center h-full relative z-10 max-w-xl mx-auto md:mx-0">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Track Your Fleet in Real-Time.
              <br />
              Optimize Your Ship Operations.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Manage up to 10 ships with live location tracking, fuel monitoring, and trip management.
            </p>
            <div>
              <Link href="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-lg rounded-full">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right side - Feature highlight */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-24 md:py-12 lg:py-16">
          <div className="px-8 md:px-16 flex flex-col justify-center h-full relative z-10 max-w-xl mx-auto md:mx-0">
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Empowering Ship Owners & Drivers with Smart Fleet Management
              </h2>
              <p className="text-gray-700 mb-8">
                At Vesselian, we believe in making ship management simple, efficient, and data-driven. Our mission is to empower ship owners and drivers with real-time tracking, fuel monitoring, and comprehensive fleet management.
              </p>
              <Link href="#features">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-full px-6">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Simple Steps to Manage Your Fleet
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <span className="text-primary font-bold text-lg">01</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Sign Up and Add Your Ships</h3>
                    <p className="text-gray-700">Create an account and register your ships in the app.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <span className="text-primary font-bold text-lg">02</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Track in Real-Time</h3>
                    <p className="text-gray-700">Monitor location, status and performance of your vessels.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 rounded-full p-3 mr-4">
                    <span className="text-primary font-bold text-lg">03</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Optimize Operations</h3>
                    <p className="text-gray-700">Use insights to improve efficiency and reduce costs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2 max-w-[58rem]">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Powerful Maritime Intelligence
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">
                Our platform combines real-time tracking with advanced analytics to provide comprehensive maritime intelligence
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {/* Feature 1 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Global Vessel Tracking</CardTitle>
                <CardDescription>
                  Real-time monitoring of over 22,000 vessels worldwide with detailed position data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Interactive world map visualization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Detailed vessel information</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Historical route tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Powerful data analysis tools for making informed business decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Predictive route analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Cargo volume reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Market trend visualization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Assistant</CardTitle>
                <CardDescription>
                  Intelligent maritime insights and automated document generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Natural language vessel queries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Automated document generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Market intelligence reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-none shadow-md bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Elite Membership</CardTitle>
                <CardDescription>
                  Premium features for oil brokers and industry professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Direct messaging with carriers</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Tender bidding tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    <span>Advanced cargo analytics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Additional features can be added here */}
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