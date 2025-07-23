import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Building2, 
  Users, 
  MessageSquare,
  Shield,
  Handshake,
  HeadphonesIcon
} from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We'll respond within 1-2 business days.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header currentPage="contact" />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-orange-500/10 text-orange-400 border-orange-500/20">
            Contact PetroDealHub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Get In Touch
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Thank you for your interest in <span className="text-orange-400 font-semibold">PetroDealHub</span> — the trusted platform for petroleum trading professionals.
          </p>
          <p className="text-lg text-white/70 max-w-3xl mx-auto mt-4">
            We value every inquiry, whether you're a broker, refinery representative, shipping operator, or simply exploring how our tools and services can support your goals in the oil trade sector.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-400" />
                Send Us a Message
              </CardTitle>
              <CardDescription className="text-white/70">
                Please use the form below or reach out to us directly using the contact information provided.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/50"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/50"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/50"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* General Inquiries */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  General Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a href="mailto:support@petrodealhub.com" className="hover:text-blue-400 transition-colors">
                    support@petrodealhub.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span>PetroDealHub, United States (Delaware-based operation)</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span>Monday to Friday, 9:00 AM – 5:00 PM (Eastern Time)</span>
                </div>
              </CardContent>
            </Card>

            {/* Legal or Compliance */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Legal or Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <a href="mailto:legal@petrodealhub.com" className="hover:text-purple-400 transition-colors">
                    legal@petrodealhub.com
                  </a>
                </div>
                <p className="text-sm text-white/60 mt-2">
                  All legal correspondence, requests, or clarifications regarding our Terms, Policies, or Subscription Services should be directed to this address.
                </p>
              </CardContent>
            </Card>

            {/* Partner With Us */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-green-400" />
                  Partner With Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-4 w-4 text-green-400" />
                  <a href="mailto:partners@petrodealhub.com" className="hover:text-green-400 transition-colors">
                    partners@petrodealhub.com
                  </a>
                </div>
                <p className="text-sm text-white/60 mt-2">
                  Are you a refinery, broker, or shipping firm interested in working with PetroDealHub? We're always open to collaboration.
                </p>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5 text-orange-400" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-4 w-4 text-orange-400" />
                  <a href="mailto:support@petrodealhub.com" className="hover:text-orange-400 transition-colors">
                    support@petrodealhub.com
                  </a>
                </div>
                <p className="text-sm text-white/60 mt-2">
                  For technical issues, account-related assistance, or subscription questions. We aim to respond within 1–2 business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feedback Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm">
            <CardContent className="pt-8">
              <MessageSquare className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">We Value Your Feedback</h3>
              <p className="text-white/70 max-w-2xl mx-auto">
                We welcome suggestions, feedback, or ideas for improving PetroDealHub. 
                Let us know how we can better serve your trading journey.
              </p>
              <div className="mt-6">
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                  Always improving for you
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  );
}