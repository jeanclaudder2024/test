import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Broker } from '@/types';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  Edit,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Lock,
  LucideIcon,
  Mail,
  MessageSquare,
  Paperclip,
  Send,
  Star,
  Upload,
  Building,
  BarChart3
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Phone, 
  Trash2,
  FileCheck,
  ShieldCheck,
  Award,
  Shield,
  HelpCircle,
  Download
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Brokers() {
  // State
  const [activeTab, setActiveTab] = useState("brokers");
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState('monthly');
  const [messageText, setMessageText] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageStatus, setMessageStatus] = useState<Record<number, string>>({});
  const [lastContactTime, setLastContactTime] = useState<Record<number, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<{
    passport: File | null;
    photo: File | null;
  }>({
    passport: null, 
    photo: null
  });
  const [shippingAddress, setShippingAddress] = useState('');
  const { toast } = useToast();

  // Query to get brokers
  const { data: brokers = [], isLoading } = useQuery<Broker[]>({
    queryKey: ['/api/brokers'],
  });
  
  // Initialize message statuses
  useEffect(() => {
    // Simulate random message statuses for each broker
    if (brokers && brokers.length > 0) {
      const statuses: Record<number, string> = {};
      const times: Record<number, string> = {};
      
      brokers.forEach(broker => {
        const statusOptions = ['unread', 'read', 'replied', 'none'];
        const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        statuses[broker.id] = randomStatus;
        
        // Generate random last contact times (between now and 7 days ago)
        const randomDays = Math.floor(Math.random() * 7);
        const randomHours = Math.floor(Math.random() * 24);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        date.setHours(date.getHours() - randomHours);
        times[broker.id] = date.toISOString();
      });
      
      setMessageStatus(statuses);
      setLastContactTime(times);
    }
  }, [brokers]);
  
  // Mutations for broker actions
  const upgradeMutation = useMutation({
    mutationFn: async (data: {
      id: number,
      subscription: 'monthly' | 'annual',
      shippingAddress: string,
      documents: {
        passportUploaded: boolean,
        photoUploaded: boolean
      }
    }) => {
      const response = await fetch(`/api/brokers/${data.id}/elite-membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to upgrade membership');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Membership Upgraded Successfully",
        description: `Your GloboOil Elite Broker Membership is active. Your ${selectedSubscription} subscription has been activated.`,
        variant: "default"
      });
      
      setShowUpgradeDialog(false);
      setActiveTab("elite-dashboard");
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Filter brokers based on search term
  const filteredBrokers = brokers.filter(broker => 
    broker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (broker.country && broker.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to handle broker deletion
  const handleDelete = (brokerId: number) => {
    toast({
      title: "Not Implemented",
      description: "Broker deletion functionality is not yet implemented.",
      variant: "default"
    });
  };
  
  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'photo') => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles({
        ...selectedFiles,
        [type]: e.target.files[0]
      });
      
      toast({
        title: `${type === 'passport' ? 'Passport' : 'Photo'} uploaded`,
        description: `File "${e.target.files[0].name}" has been selected.`,
      });
    }
  };
  
  // Function to handle viewing broker details
  const handleViewBroker = (broker: Broker) => {
    setSelectedBroker(broker);
    setShowProfileDialog(true);
  };

  // Message sending mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      brokerId: number,
      subject: string,
      message: string
    }) => {
      // In a real app, this would send a message to the API
      // For now, we'll use a simulated response
      return { success: true, messageId: Date.now().toString() };
    },
    onSuccess: (_, variables) => {
      // Update the message status for this broker
      setMessageStatus(prev => ({
        ...prev,
        [variables.brokerId]: 'sent'
      }));
      
      // Update the last contact time
      setLastContactTime(prev => ({
        ...prev,
        [variables.brokerId]: new Date().toISOString()
      }));
      
      toast({
        title: "رسالة أرسلت / Message Sent",
        description: `Your message to ${selectedBroker?.name} has been sent successfully.`,
        variant: "default"
      });
      
      // Reset the message form
      setMessageText('');
      setMessageSubject('');
      setShowMessageDialog(false);
    },
    onError: (error) => {
      toast({
        title: "فشل الإرسال / Sending Failed",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Function to handle sending messages
  const handleSendMessage = (brokerId: number) => {
    if (!messageSubject.trim()) {
      toast({
        title: "الموضوع مطلوب / Subject Required",
        description: "Please enter a subject for your message.",
        variant: "destructive"
      });
      return;
    }
    
    if (!messageText.trim()) {
      toast({
        title: "الرسالة مطلوبة / Message Required",
        description: "Please enter your message text.",
        variant: "destructive"
      });
      return;
    }
    
    sendMessageMutation.mutate({
      brokerId,
      subject: messageSubject,
      message: messageText
    });
  };
  
  // Function to open message dialog
  const handleMessageBroker = (broker: Broker) => {
    setSelectedBroker(broker);
    // Set a default subject if the broker is replying to an existing message
    if (messageStatus[broker.id] === 'unread') {
      setMessageSubject('RE: Your recent inquiry');
    } else {
      setMessageSubject('');
    }
    setMessageText('');
    setShowMessageDialog(true);
  };
  
  // Function to get status badge for message
  const getMessageStatusBadge = (brokerId: number) => {
    const status = messageStatus[brokerId];
    
    if (!status || status === 'none') {
      return null;
    }
    
    switch(status) {
      case 'unread':
        return <Badge className="bg-red-500 text-white">جديد / New</Badge>;
      case 'read':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">مقروء / Read</Badge>;
      case 'replied':
        return <Badge variant="outline" className="border-green-500 text-green-700">تم الرد / Replied</Badge>;
      case 'sent':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">أرسلت / Sent</Badge>;
      default:
        return null;
    }
  };
  
  // Function to format last contact time
  const getLastContactTime = (brokerId: number) => {
    const timestamp = lastContactTime[brokerId];
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Function to handle membership upgrade
  const handleUpgradeMembership = () => {
    if (!selectedFiles.passport || !selectedFiles.photo) {
      toast({
        title: "Required Files Missing",
        description: "Please upload both passport and photo.",
        variant: "destructive"
      });
      return;
    }
    
    if (!shippingAddress) {
      toast({
        title: "Shipping Address Required",
        description: "Please enter your shipping address for the membership card.",
        variant: "destructive"
      });
      return;
    }
    
    // Use a default broker ID for demo purposes
    // In a real app, this would be the ID of the currently logged-in broker
    const brokerId = brokers.length > 0 ? brokers[0].id : 1;
    
    // Call the mutation to upgrade the membership
    upgradeMutation.mutate({
      id: brokerId,
      subscription: selectedSubscription as 'monthly' | 'annual',
      shippingAddress,
      documents: {
        passportUploaded: !!selectedFiles.passport,
        photoUploaded: !!selectedFiles.photo
      }
    });
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs 
        defaultValue="brokers" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-2 text-primary" />
              Oil Broker Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage brokers and elite membership services
            </p>
          </div>
          
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3 h-auto">
            <TabsTrigger value="brokers" className="px-3 py-2">
              <Users className="h-4 w-4 mr-2 md:mr-2" />
              <span className="hidden sm:inline-block mr-1">Broker</span> Directory
            </TabsTrigger>
            <TabsTrigger value="elite-membership" className="px-3 py-2">
              <Star className="h-4 w-4 mr-2 md:mr-2" />
              <span className="hidden sm:inline-block mr-1">Elite</span> Membership
            </TabsTrigger>
            <TabsTrigger value="elite-dashboard" className="px-3 py-2">
              <Shield className="h-4 w-4 mr-2 md:mr-2" />
              <span className="hidden sm:inline-block mr-1">Elite</span> Dashboard
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Brokers Directory Tab */}
        <TabsContent value="brokers" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Broker Directory</h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading brokers...' : `${brokers.length} brokers in the system`}
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search brokers..."
                  className="pl-8 w-full md:w-[260px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Broker
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredBrokers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No brokers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? `No brokers matching "${searchTerm}"` : 'No brokers available in the system.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrokers.map((broker) => (
                <Card key={broker.id} className="overflow-hidden border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {broker.name}
                          {broker.eliteMember && (
                            <Badge className="ml-2 bg-amber-500 text-white">
                              <Star className="h-3 w-3 mr-1" /> Elite
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {broker.company}
                        </CardDescription>
                      </div>
                      <Badge variant={broker.active ? "default" : "secondary"} className={broker.active ? "bg-green-500" : ""}>
                        {broker.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`mailto:${broker.email}`} className="text-primary hover:underline">
                          {broker.email}
                        </a>
                      </div>
                      
                      {broker.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={`tel:${broker.phone}`} className="hover:underline">
                            {broker.phone}
                          </a>
                        </div>
                      )}
                      
                      <div className="text-sm pt-1">
                        <span className="text-muted-foreground">Country: </span>
                        <span>{broker.country || 'Not specified'}</span>
                      </div>
                      
                      {/* Message Status */}
                      {messageStatus[broker.id] && messageStatus[broker.id] !== 'none' && (
                        <div className="flex justify-between items-center pt-1 text-sm">
                          <div className="flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Message Status:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getMessageStatusBadge(broker.id)}
                            {getLastContactTime(broker.id) && (
                              <span className="text-xs text-muted-foreground">
                                {getLastContactTime(broker.id)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMessageBroker(broker)}
                          className="relative"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span>Message</span>
                          {messageStatus[broker.id] === 'unread' && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewBroker(broker)}>
                              <Users className="h-4 w-4 mr-2" />
                              عرض التفاصيل / View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleMessageBroker(broker)}
                              className="relative"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              إرسال رسالة / Send Message
                              {messageStatus[broker.id] === 'unread' && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full"></span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Globe className="h-4 w-4 mr-2" />
                              تعيين سفينة / Assign Vessel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(broker.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              حذف الوسيط / Delete Broker
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Elite Membership Tab */}
        <TabsContent value="elite-membership">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card className="bg-gradient-to-br from-white to-amber-50 shadow-md border-none overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <Award className="h-24 w-24 text-amber-200 opacity-20" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-amber-900 flex items-center">
                    <Star className="h-6 w-6 mr-2 text-amber-500" />
                    Elite Broker Membership
                  </CardTitle>
                  <CardDescription className="text-amber-800 text-base">
                    Exclusive benefits for professional oil brokers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-amber-500" />
                      Official Membership Card
                    </h3>
                    <p className="text-gray-700">
                      Receive a physical membership card with your name, membership number, and expiration date.
                      Contains a QR code linking to your GloboOil profile.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2 text-amber-500" />
                      Access to Protected Sections
                    </h3>
                    <p className="text-gray-700">
                      Unlock confidential documents, advanced oil trading maps, and AI-generated customized reports.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
                      Direct Communication Channel
                    </h3>
                    <p className="text-gray-700">
                      Send offers directly to global oil companies and establish private communication channels with supply managers.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-amber-500" />
                      Tender Tool Access
                    </h3>
                    <p className="text-gray-700">
                      Bid on available oil shipments in real-time and view open opportunities as they become available.
                    </p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-amber-500" />
                      Exclusive Control Panel
                    </h3>
                    <p className="text-gray-700">
                      Access to available shipments, active contracts, negotiation opportunities, and proposal submission tools.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="flex justify-between w-full border-t border-amber-100 pt-4">
                    <div>
                      <p className="text-xl font-bold text-amber-900">
                        Subscription Options:
                      </p>
                      <div className="flex space-x-4 mt-2">
                        <div>
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                            Monthly: $199/month
                          </Badge>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                            Annual: $1,999/year
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    size="lg"
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Upgrade to Elite Membership
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Membership Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Enhanced Market Access</h4>
                        <p className="text-sm text-gray-600">
                          Priority access to new vessel routes and refinery outputs before they're announced publicly.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Verified Broker Status</h4>
                        <p className="text-sm text-gray-600">
                          Elite badge displayed on your profile, enhancing credibility with oil companies and refineries.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">International Trade Events</h4>
                        <p className="text-sm text-gray-600">
                          Invitations to exclusive oil trading conferences and networking events worldwide.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Advanced Analytics</h4>
                        <p className="text-sm text-gray-600">
                          Proprietary market insights and prediction tools based on AI analysis of global oil movements.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Priority Support</h4>
                        <p className="text-sm text-gray-600">
                          Dedicated account manager and 24/7 priority technical support line.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="italic text-gray-700">
                        "The Elite Membership has transformed my oil brokerage business. The direct communication channel with refineries has helped me close deals 40% faster."
                      </p>
                      <div className="mt-2 font-medium">Ahmed K. - Dubai, UAE</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="italic text-gray-700">
                        "Access to confidential market data and tender opportunities has given my firm a competitive edge. The annual membership paid for itself within the first month."
                      </p>
                      <div className="mt-2 font-medium">Maria L. - Rotterdam, Netherlands</div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="italic text-gray-700">
                        "The official membership card opens doors at international oil conferences. I've made valuable connections that would have been impossible otherwise."
                      </p>
                      <div className="mt-2 font-medium">John D. - Houston, USA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Elite Dashboard Tab */}
        <TabsContent value="elite-dashboard">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-500" />
                  Elite Broker Control Panel
                </h2>
                <p className="text-muted-foreground">
                  Access exclusive trading tools and premium features
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" /> عضو نخبة / Elite Member
                </Badge>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  اشتراك شهري / Monthly
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  نشط / Active
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Confidential Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Access secure and private oil trading templates, SPAs, and bank guarantees.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Standard Trading Agreement</span>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Bank Guarantee Template</span>
                      </div>
                      <Badge variant="outline">DOCX</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Confidential Price List Q2 2023</span>
                      </div>
                      <Badge variant="outline">XLSX</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض جميع المستندات / View All Documents",
                        description: "Navigating to document management page",
                      });
                      window.location.href = "/documents";
                    }}
                  >
                    عرض جميع المستندات / View All Documents
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary" />
                    Oil Company Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect with major oil companies and manage deals through our powerful broker dashboard.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      className="w-full"
                      onClick={() => window.location.href = '/broker-dashboard'}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Access Broker Dashboard
                    </Button>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Saudi Aramco</span>
                      </div>
                      <Badge className="bg-green-500">متصل / Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Shell Trading</span>
                      </div>
                      <Badge className="bg-green-500">متصل / Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">ADNOC Distribution</span>
                      </div>
                      <Badge variant="outline">طلب وصول / Request Access</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض جميع الشركات / View All Companies",
                        description: "Opening company directory",
                      });
                      window.location.href = "/refineries";
                    }}
                  >
                    عرض جميع الشركات / View All Companies
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Active Tenders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Bid on open oil shipment tenders in real-time.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">2M bbl Crude Oil FOB Arabian Gulf</span>
                      </div>
                      <Badge className="bg-amber-500">يغلق / Closes {formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'dd MMM')}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">750K bbl LSFO CIF Rotterdam</span>
                      </div>
                      <Badge className="bg-amber-500">يغلق / Closes {formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'dd MMM')}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">350K MT Low Sulfur Gasoil CIF ARA</span>
                      </div>
                      <Badge className="bg-red-500 text-white">يغلق اليوم / Closes Today</Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض جميع المناقصات / View All Tenders",
                        description: "Opening tender listings page",
                      });
                      // Open a dialog to show all tenders
                      window.location.href = "/trading";
                    }}
                  >
                    عرض جميع المناقصات / View All Tenders
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Market Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Access premium market data and AI-powered insights.
                  </p>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                    [Price Chart Visualization]
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <div className="text-xs text-gray-500">Brent Crude</div>
                      <div className="text-lg font-semibold">$89.76</div>
                      <div className="text-xs text-green-500">+1.82%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <div className="text-xs text-gray-500">WTI Crude</div>
                      <div className="text-lg font-semibold">$86.34</div>
                      <div className="text-xs text-green-500">+1.45%</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض التحليلات الكاملة / View Full Analytics",
                        description: "Opening comprehensive market analytics dashboard",
                      });
                      window.location.href = "/trading";
                    }}
                  >
                    عرض التحليلات الكاملة / View Full Analytics
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Secure Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Encrypted messaging with oil companies and other brokers.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">RE: Saudi Aramco Tender Response</span>
                      </div>
                      <Badge className="bg-red-500 text-white">جديد / New</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Contract Negotiation - Shell</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000), 'dd MMM')}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Q2 Pricing Discussion</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'dd MMM')}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض جميع الرسائل / View All Messages",
                        description: "Opening secure messaging center",
                      });
                      
                      // Create a sample broker if none exists
                      const targetBroker = brokers.length > 0 ? brokers[0] : {
                        id: 1,
                        name: "Sample Broker",
                        company: "Test Company",
                        email: "sample@example.com",
                        active: true
                      };
                      
                      // Open the message dialog with the selected broker
                      setSelectedBroker(targetBroker);
                      setMessageSubject("New message");
                      setMessageText("");
                      setShowMessageDialog(true);
                    }}
                  >
                    عرض جميع الرسائل / View All Messages
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                    Membership Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-amber-600 to-amber-900 p-4 rounded-xl text-white shadow-lg">
                    <div className="flex justify-between">
                      <div className="text-xl font-bold">Vesselian</div>
                      <Star className="h-6 w-6" />
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-80">وسيط نخبة / ELITE BROKER</div>
                        <div className="text-lg font-bold">{brokers.length > 0 ? brokers[0].name?.toUpperCase() : 'ELITE MEMBER'}</div>
                        <div className="text-xs mt-1 opacity-80">عضو منذ / MEMBER SINCE {formatDate(new Date(), 'yyyy')}</div>
                      </div>
                      <div className="bg-white/20 p-2 rounded">
                        <div className="text-xs">ID</div>
                        <div className="font-mono">#{brokers.length > 0 ? `EB${brokers[0].id}${Date.now().toString().slice(-5)}` : 'EB12345'}</div>
                      </div>
                    </div>
                    <div className="mt-6 bg-white/10 p-2 rounded flex justify-between">
                      <div className="text-xs">ساري حتى / VALID UNTIL</div>
                      <div>{formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'MM/yyyy')}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-center text-gray-500">
                    Your physical membership card has been dispatched and will arrive in 5-7 business days.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض تفاصيل العضوية / View Membership Details",
                        description: "Opening membership details and billing information",
                      });
                      // Future implementation to show detailed membership info:
                      // setShowMembershipDetailsDialog(true);
                    }}
                  >
                    عرض تفاصيل العضوية / View Membership Details
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    التحديثات المباشرة / Real-Time Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    آخر أحداث السوق في الوقت الحقيقي / Latest market events in real-time
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 border-l-4 border-green-500 bg-green-50 rounded-r-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm font-medium">سعر خام برنت / Brent Crude</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 10 * 60 * 1000), 'HH:mm')}</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        ارتفع سعر خام برنت بنسبة 2.1٪ بسبب تخفيضات الإنتاج المتوقعة / Brent Crude up 2.1% on anticipated production cuts
                      </p>
                    </div>
                    
                    <div className="p-2 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">وصول ناقلة / Vessel Arrival</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 35 * 60 * 1000), 'HH:mm')}</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        وصلت الناقلة "ستار إكسبلورر" إلى ميناء الدمام / Vessel "Star Explorer" arrived at Dammam Port
                      </p>
                    </div>
                    
                    <div className="p-2 border-l-4 border-amber-500 bg-amber-50 rounded-r-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                          <span className="text-sm font-medium">مناقصة جديدة / New Tender</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 120 * 60 * 1000), 'HH:mm')}</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        أعلنت أرامكو السعودية عن مناقصة جديدة لـ 500 ألف برميل من الديزل منخفض الكبريت / Saudi Aramco announced new tender for 500K bbl ULSD
                      </p>
                    </div>
                    
                    <div className="p-2 border-l-4 border-red-500 bg-red-50 rounded-r-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ArrowDownRight className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm font-medium">سعر خام WTI / WTI Crude</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(new Date(Date.now() - 185 * 60 * 1000), 'HH:mm')}</span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">
                        انخفض سعر خام غرب تكساس الوسيط بنسبة 1.2٪ بسبب ارتفاع المخزونات / WTI Crude down 1.2% on higher inventories 
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "عرض جميع التحديثات / View All Updates",
                        description: "Opening full market events log",
                      });
                    }}
                  >
                    عرض جميع التحديثات / View All Updates
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Membership Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              ترقية إلى عضوية الوسيط النخبة / Upgrade to Elite Broker Membership
            </DialogTitle>
            <DialogDescription>
              أكمل الخطوات التالية لتفعيل مزايا عضوية النخبة الخاصة بك / Complete the following steps to activate your elite membership benefits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                المستندات المطلوبة / Required Documents
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Passport Copy (Colored)</label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    {selectedFiles.passport ? (
                      <div className="text-sm">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-1" />
                        <p className="font-medium text-green-600">Uploaded</p>
                        <p className="text-gray-500">{selectedFiles.passport.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG or PDF (max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, 'passport')}
                      accept="image/png,image/jpeg,application/pdf"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Photo</label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    {selectedFiles.photo ? (
                      <div className="text-sm">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-1" />
                        <p className="font-medium text-green-600">Uploaded</p>
                        <p className="text-gray-500">{selectedFiles.photo.name}</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                        <p className="text-sm text-gray-500">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG or JPG (max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, 'photo')}
                      accept="image/png,image/jpeg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  خيارات العضوية / Membership Options
                </h3>
                
                <div className="space-y-3">
                  <div 
                    className={`border rounded-md p-3 flex justify-between cursor-pointer ${selectedSubscription === 'monthly' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedSubscription('monthly')}
                  >
                    <div>
                      <div className="font-medium">Monthly Plan</div>
                      <div className="text-sm text-gray-500">Billed monthly, cancel anytime</div>
                    </div>
                    <div className="font-bold text-lg">$199/mo</div>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-3 flex justify-between cursor-pointer ${selectedSubscription === 'annual' ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => setSelectedSubscription('annual')}
                  >
                    <div>
                      <div className="font-medium">Annual Plan</div>
                      <div className="text-sm text-gray-500">Billed yearly, save 16%</div>
                    </div>
                    <div className="font-bold text-lg">$1,999/yr</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  عنوان الشحن / Shipping Address
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  لتوصيل بطاقة العضوية المادية الخاصة بك / For delivery of your physical membership card
                </p>
                <Textarea 
                  placeholder="Enter your full shipping address with postal code" 
                  className="min-h-[120px]"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              إلغاء / Cancel
            </Button>
            <Button 
              onClick={handleUpgradeMembership}
              className="bg-amber-600 hover:bg-amber-700 sm:flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              ترقية العضوية / Upgrade Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          {selectedBroker && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary" />
                    إرسال رسالة / Send Message
                  </DialogTitle>
                </div>
                <DialogDescription>
                  إرسال رسالة مشفرة إلى {selectedBroker.name} / Send an encrypted message to {selectedBroker.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedBroker.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedBroker.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedBroker.company}</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        الموضوع / Subject
                      </Label>
                      <Input 
                        id="subject" 
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                        placeholder="Enter message subject"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message-priority" className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        الأولوية / Priority
                      </Label>
                      <Select defaultValue="normal">
                        <SelectTrigger id="message-priority" className="w-full mt-1">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">منخفضة / Low</SelectItem>
                          <SelectItem value="normal">عادية / Normal</SelectItem>
                          <SelectItem value="high">عالية / High</SelectItem>
                          <SelectItem value="urgent">عاجلة / Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="message-category" className="flex items-center">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        الفئة / Category
                      </Label>
                      <Select defaultValue="general">
                        <SelectTrigger id="message-category" className="w-full mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">عام / General</SelectItem>
                          <SelectItem value="contract">عقود / Contracts</SelectItem>
                          <SelectItem value="tender">مناقصات / Tenders</SelectItem>
                          <SelectItem value="shipment">شحنات / Shipments</SelectItem>
                          <SelectItem value="pricing">التسعير / Pricing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        التشفير / Encryption
                      </Label>
                      <div className="mt-1 flex items-center justify-between p-2 border rounded-md bg-slate-50">
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm">تشفير نهاية لنهاية / End-to-end encryption</span>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      نص الرسالة / Message Text
                    </Label>
                    <Textarea 
                      id="message"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter your message here..."
                      className="mt-1 min-h-[150px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        إشعارات / Notifications
                      </Label>
                      <div className="mt-1 flex flex-col space-y-2 p-2 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="message-notify-email" defaultChecked />
                          <label htmlFor="message-notify-email" className="text-sm text-gray-700">
                            البريد الإلكتروني / Email
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="message-notify-sms" />
                          <label htmlFor="message-notify-sms" className="text-sm text-gray-700">
                            الرسائل النصية / SMS
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2" />
                        المرفقات / Attachments
                      </Label>
                      <div className="mt-1 border-2 border-dashed rounded-md p-4 text-center">
                        <div>
                          <Paperclip className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                          <p className="text-sm text-gray-500">
                            اسحب وأفلت الملفات هنا أو انقر لتحميلها / Drop files here or click to upload
                          </p>
                          <p className="text-xs text-gray-400">
                            PDF, DOCX, XLSX, PNG, JPG (max 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          multiple
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  إلغاء / Cancel
                </Button>
                <Button 
                  onClick={() => handleSendMessage(selectedBroker.id)}
                  className="sm:flex-1"
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      جاري الإرسال / Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      إرسال الرسالة / Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Broker Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBroker && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">ملف الوسيط / Broker Profile</DialogTitle>
                  {selectedBroker.eliteMember && (
                    <Badge className="bg-amber-500 text-white">
                      <Star className="h-3 w-3 mr-1" /> نخبة / Elite
                    </Badge>
                  )}
                </div>
                <DialogDescription>
                  تفاصيل الملف ومعلومات الاتصال / Profile details and contact information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {selectedBroker.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center">
                      <h3 className="font-bold text-lg">{selectedBroker.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedBroker.company}</p>
                    </div>
                    
                    <Badge variant={selectedBroker.active ? "default" : "secondary"} className={selectedBroker.active ? "bg-green-500" : ""}>
                      {selectedBroker.active ? "نشط / Active" : "غير نشط / Inactive"}
                    </Badge>
                    
                    <div className="flex flex-col space-y-2 w-full mt-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        اتصال / Contact
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        مستندات / Documents
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        سفن / Vessels
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">معلومات الاتصال / Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">Email:</dt>
                          <dd>
                            <a href={`mailto:${selectedBroker.email}`} className="text-primary hover:underline">
                              {selectedBroker.email}
                            </a>
                          </dd>
                        </div>
                        
                        {selectedBroker.phone && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Phone:</dt>
                            <dd>
                              <a href={`tel:${selectedBroker.phone}`} className="hover:underline">
                                {selectedBroker.phone}
                              </a>
                            </dd>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <dt className="font-medium">Country:</dt>
                          <dd>{selectedBroker.country || 'Not specified'}</dd>
                        </div>
                        
                        {selectedBroker.shippingAddress && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Shipping Address:</dt>
                            <dd>{selectedBroker.shippingAddress}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">تفاصيل الوسيط / Broker Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="font-medium">ID:</dt>
                          <dd>{selectedBroker.id}</dd>
                        </div>
                        
                        <div className="flex justify-between">
                          <dt className="font-medium">Company:</dt>
                          <dd>{selectedBroker.company || 'Not specified'}</dd>
                        </div>
                        
                        {selectedBroker.subscriptionPlan && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Subscription Plan:</dt>
                            <dd>{selectedBroker.subscriptionPlan}</dd>
                          </div>
                        )}
                        
                        {selectedBroker.membershipId && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Membership ID:</dt>
                            <dd>{selectedBroker.membershipId}</dd>
                          </div>
                        )}
                        
                        {selectedBroker.lastLogin && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Last Login:</dt>
                            <dd>{formatDate(selectedBroker.lastLogin)}</dd>
                          </div>
                        )}
                        
                        {selectedBroker.eliteMember && selectedBroker.eliteMemberSince && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Elite Member Since:</dt>
                            <dd>{formatDate(selectedBroker.eliteMemberSince)}</dd>
                          </div>
                        )}
                        
                        {selectedBroker.eliteMember && selectedBroker.eliteMemberExpires && (
                          <div className="flex justify-between">
                            <dt className="font-medium">Elite Membership Expires:</dt>
                            <dd>{formatDate(selectedBroker.eliteMemberExpires)}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                  إغلاق / Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل الملف / Edit Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}