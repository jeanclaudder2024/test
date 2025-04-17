import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Broker } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  CreditCard,
  FileCheck,
  Upload,
  Star,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  FileText,
  Building,
  Calendar,
  CheckCircle2,
  Award,
  Shield,
  Globe,
  AlertCircle,
  HelpCircle,
  Send,
  Download,
  ArrowUpRight,
  FileCheck2,
  ArrowDownRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Brokers() {
  // State
  const [activeTab, setActiveTab] = useState("brokers");
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState('monthly');
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
                      
                      <div className="flex justify-between pt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuItem>Assign Vessel</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(broker.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Broker
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
                  <Shield className="h-5 w-5 mr-2 text-amber-500" />
                  Elite Broker Control Panel
                </h2>
                <p className="text-muted-foreground">
                  Access exclusive trading tools and premium features
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" /> Elite Member
                </Badge>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  Monthly Subscription
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="col-span-1">
                <Card className="bg-primary/5 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Loading dashboard...", description: "الصفحة الرئيسية قيد التحميل" })}>
                        <FileText className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening messages...", description: "جاري فتح الرسائل" })}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                        <Badge className="ml-auto" variant="destructive">3</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening active tenders...", description: "جاري فتح المناقصات النشطة" })}>
                        <Globe className="h-4 w-4 mr-2" />
                        Active Tenders
                        <Badge className="ml-auto">12</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening your bids...", description: "جاري فتح عروضك" })}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        My Bids
                        <Badge className="ml-auto">4</Badge>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening company directory...", description: "جاري فتح دليل الشركات" })}>
                        <Building className="h-4 w-4 mr-2" />
                        Company Directory
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening market reports...", description: "جاري فتح تقارير السوق" })}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Market Reports
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Opening trade calendar...", description: "جاري فتح تقويم التداول" })}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Trade Calendar
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => toast({ title: "Connecting to elite support...", description: "جاري الاتصال بالدعم المميز" })}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Elite Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-span-1 lg:col-span-3 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Tender Opportunities</CardTitle>
                    <CardDescription>
                      Premium oil shipment tenders available for elite brokers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Premium
                            </Badge>
                            <CardTitle className="text-base">Saudi Aramco Tender #SA-42187</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">Crude Oil</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">450,000 barrels</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Ras Tanura</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">Jun 15-25, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 21, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Tender details", 
                                description: "تفاصيل المناقصة قيد التحميل" 
                              })}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Bid placement form", 
                                description: "نموذج تقديم العرض قيد التحميل" 
                              })}
                            >
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">
                              New
                            </Badge>
                            <CardTitle className="text-base">ADNOC Tender #AD-2254</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">Murban Crude</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">250,000 barrels</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Jebel Dhanna</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">May 20-30, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 25, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Tender details", 
                                description: "تفاصيل المناقصة قيد التحميل" 
                              })}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Bid placement form", 
                                description: "نموذج تقديم العرض قيد التحميل" 
                              })}
                            >
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        <Card className="bg-white/90 hover:shadow-md transition-shadow border-amber-100">
                          <CardHeader className="p-4 pb-2">
                            <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Exclusive
                            </Badge>
                            <CardTitle className="text-base">Rosneft Tender #RN-9856</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cargo:</span>
                                <span className="font-medium">ESPO Blend</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">100,000 tonnes</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Loading Port:</span>
                                <span className="font-medium">Kozmino</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Window:</span>
                                <span className="font-medium">Jul 1-10, 2025</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Closing Date:</span>
                                <span className="font-medium text-red-600">Apr 30, 2025</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Tender details", 
                                description: "تفاصيل المناقصة قيد التحميل" 
                              })}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => toast({ 
                                title: "Bid placement form", 
                                description: "نموذج تقديم العرض قيد التحميل" 
                              })}
                            >
                              <ArrowUpRight className="h-3 w-3 mr-2" />
                              Place Bid
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => toast({ 
                            title: "View all tenders", 
                            description: "جاري فتح جميع المناقصات" 
                          })}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          View All Tenders (12)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                        Recent Messages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">RA</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Rosatom Energy Trading</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              We have received your offer for the North Sea crude delivery and would like to discuss terms...
                            </p>
                            <p className="text-xs text-gray-500">Today, 10:32 AM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">SA</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Saudi Aramco</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              Your bid for tender #SA-42187 is under review. Please provide vessel documentation...
                            </p>
                            <p className="text-xs text-gray-500">Yesterday, 3:45 PM</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-md">
                          <Avatar>
                            <AvatarFallback className="bg-primary/20">BP</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">BP Trading</p>
                              <Badge variant="destructive">New</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              Confirming receipt of your proposal. Our team will analyze the terms and get back...
                            </p>
                            <p className="text-xs text-gray-500">Apr 15, 2025</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => toast({ 
                            title: "Opening inbox", 
                            description: "جاري فتح صندوق الوارد" 
                          })}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Inbox
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                        Market Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Crude Oil Price</h4>
                            <Badge className="bg-green-500">+2.3%</Badge>
                          </div>
                          <div className="h-[60px] bg-gray-100 rounded-md overflow-hidden relative">
                            <div className="absolute inset-0 flex items-end">
                              <div className="h-[40%] w-[10%] bg-gray-300"></div>
                              <div className="h-[45%] w-[10%] bg-gray-300"></div>
                              <div className="h-[35%] w-[10%] bg-gray-300"></div>
                              <div className="h-[50%] w-[10%] bg-gray-300"></div>
                              <div className="h-[48%] w-[10%] bg-gray-300"></div>
                              <div className="h-[42%] w-[10%] bg-gray-300"></div>
                              <div className="h-[60%] w-[10%] bg-green-300"></div>
                              <div className="h-[65%] w-[10%] bg-green-400"></div>
                              <div className="h-[75%] w-[10%] bg-green-500"></div>
                              <div className="h-[80%] w-[10%] bg-green-600"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Apr 10</span>
                            <span>Apr 17</span>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <h4 className="text-sm font-medium mb-2">Premium Market Reports</h4>
                          <div className="space-y-2">
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">Asia-Pacific Demand Forecast Q2 2025</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast({ 
                                  title: "Downloading report", 
                                  description: "جاري تحميل التقرير" 
                                })}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">OPEC+ Output Strategy Analysis</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast({ 
                                  title: "Downloading report", 
                                  description: "جاري تحميل التقرير" 
                                })}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm">Vessel Availability Report - April 2025</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast({ 
                                  title: "Downloading report", 
                                  description: "جاري تحميل التقرير" 
                                })}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={() => toast({ 
                            title: "Opening market reports", 
                            description: "جاري فتح تقارير السوق" 
                          })}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View All Reports
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
              Upgrade to Elite Broker Membership
            </DialogTitle>
            <DialogDescription>
              Complete the following steps to activate your elite membership benefits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Required Documents
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
                  Membership Options
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
                  Shipping Address
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  For delivery of your physical membership card
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
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradeMembership}
              className="bg-amber-600 hover:bg-amber-700 sm:flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Upgrade Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}