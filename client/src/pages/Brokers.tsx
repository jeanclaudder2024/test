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
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Import icons
import {
  Star,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  Calendar,
  CheckCircle2,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  CreditCard,
  Settings,
  ExternalLink,
  FileCheck,
  BarChart3,
  Globe,
  HelpCircle,
  AlertCircle,
  Plus,
  Download,
} from 'lucide-react';

// Import date formatting
import { format as formatDate } from 'date-fns';

export default function Brokers() {
  const { toast } = useToast();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState('brokers');
  
  // Broker data state
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  
  // Elite membership state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<'monthly' | 'annual'>('annual');
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{
    passport?: File;
    businessLicense?: File;
    photoId?: File;
  }>({});
  
  // Fetch brokers data
  const { data: brokers = [], isLoading, error } = useQuery<Broker[]>({
    queryKey: ['/api/brokers'],
  });
  
  // Message broker mutation
  const messageMutation = useMutation({
    mutationFn: async (messageData: { 
      brokerId: number; 
      subject: string; 
      content: string;
    }) => {
      const res = await apiRequest('POST', '/api/messages', messageData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'تم إرسال الرسالة / Message Sent',
        description: 'Your message has been delivered successfully.',
      });
      setShowMessageDialog(false);
      setMessageSubject('');
      setMessageContent('');
    },
    onError: (error: Error) => {
      toast({
        title: 'فشل في الإرسال / Sending Failed',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle broker selection for details
  const handleViewBroker = (broker: Broker) => {
    setSelectedBroker(broker);
    setShowDetails(true);
  };
  
  // Handle broker selection for messaging
  const handleMessageBroker = (broker: Broker) => {
    setSelectedBroker(broker);
    setShowMessageDialog(true);
  };
  
  // Handle message submission
  const handleSendMessage = () => {
    if (!selectedBroker || !messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: 'بيانات غير مكتملة / Incomplete Data',
        description: 'Please fill in all required message fields.',
        variant: 'destructive',
      });
      return;
    }
    
    messageMutation.mutate({
      brokerId: selectedBroker.id,
      subject: messageSubject,
      content: messageContent,
    });
  };
  
  // Handle file selection for elite membership
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof selectedFiles) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };
  
  // Handle elite membership upgrade
  const handleUpgradeMembership = () => {
    // Ensure required documents are provided
    if (!selectedFiles.passport || !selectedFiles.businessLicense) {
      toast({
        title: 'وثائق مطلوبة / Required Documents',
        description: 'Please upload all required documents to proceed.',
        variant: 'destructive',
      });
      return;
    }
    
    // Here would be the API call to upgrade the membership
    // For now, just show a success toast
    toast({
      title: 'تمت الترقية بنجاح / Upgrade Successful',
      description: 'Your membership has been upgraded to Elite status.',
    });
    
    setShowUpgradeDialog(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Briefcase className="h-8 w-8 mr-2 text-primary" />
        وسطاء النفط / Oil Brokers
      </h1>
      
      <Tabs defaultValue="brokers" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="brokers" onClick={() => setActiveTab('brokers')}>
            <User className="h-4 w-4 mr-2" />
            وسطاء / Brokers
          </TabsTrigger>
          <TabsTrigger value="elite-membership" onClick={() => setActiveTab('elite-membership')}>
            <Star className="h-4 w-4 mr-2" />
            عضوية النخبة / Elite Membership
          </TabsTrigger>
          <TabsTrigger value="elite-dashboard" onClick={() => setActiveTab('elite-dashboard')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            لوحة النخبة / Elite Dashboard
          </TabsTrigger>
        </TabsList>
        
        {/* Brokers Tab */}
        <TabsContent value="brokers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <p>جاري التحميل... / Loading...</p>
            ) : error ? (
              <p className="text-red-500">Error: {(error as Error).message}</p>
            ) : brokers.length === 0 ? (
              <p>لا يوجد وسطاء / No brokers found</p>
            ) : (
              brokers.map((broker) => (
                <Card key={broker.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{broker.name}</CardTitle>
                      {broker.isElite && (
                        <Badge className="bg-amber-500">
                          <Star className="h-3 w-3 mr-1" /> Elite
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{broker.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{broker.company}</span>
                    </div>
                    {broker.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{broker.email}</span>
                      </div>
                    )}
                    {broker.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{broker.phone}</span>
                      </div>
                    )}
                    {broker.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{broker.location}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewBroker(broker)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      عرض / View
                    </Button>
                    <Button 
                      onClick={() => handleMessageBroker(broker)}
                      className="relative"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      مراسلة / Message
                      {broker.hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Elite Membership Tab */}
        <TabsContent value="elite-membership">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-500" />
                  عضوية النخبة / Elite Membership Benefits
                </CardTitle>
                <CardDescription>
                  احصل على مزايا حصرية لوسطاء النفط النخبة / Exclusive benefits for elite oil brokers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">الوصول المباشر إلى شركات النفط / Direct Access to Oil Companies</h3>
                      <p className="text-sm text-muted-foreground">Connect directly with refineries and oil producers without intermediaries.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">مناقصات حصرية / Exclusive Tenders</h3>
                      <p className="text-sm text-muted-foreground">Access restricted tender offers not available to regular brokers.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">تحليلات السوق المتقدمة / Advanced Market Analytics</h3>
                      <p className="text-sm text-muted-foreground">Gain insights with premium oil market data and AI-powered analysis.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">وثائق قانونية احترافية / Professional Legal Documents</h3>
                      <p className="text-sm text-muted-foreground">Access to premium oil trading document templates and generators.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">بطاقة عضوية فعلية / Physical Membership Card</h3>
                      <p className="text-sm text-muted-foreground">Receive an official elite broker membership card for industry events.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary shrink-0" />
                    <div>
                      <h3 className="font-medium">دعم على مدار الساعة / 24/7 Priority Support</h3>
                      <p className="text-sm text-muted-foreground">Get dedicated assistance from oil trading specialists anytime.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-semibold text-amber-800">خطط العضوية / Membership Plans</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-amber-200 rounded-lg bg-white">
                      <div className="font-bold text-lg mb-1">شهري / Monthly</div>
                      <div className="text-2xl font-bold text-amber-600 mb-3">$199 <span className="text-sm font-normal text-gray-600">/ شهر (month)</span></div>
                      <ul className="text-sm space-y-2 mb-4">
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          جميع المزايا / All benefits included
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          إلغاء في أي وقت / Cancel anytime
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border-2 border-amber-500 rounded-lg bg-white relative">
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">موصى به / Recommended</div>
                      <div className="font-bold text-lg mb-1">سنوي / Annual</div>
                      <div className="text-2xl font-bold text-amber-600 mb-3">$1,999 <span className="text-sm font-normal text-gray-600">/ سنة (year)</span></div>
                      <ul className="text-sm space-y-2 mb-4">
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          جميع المزايا / All benefits included
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          توفير 16% / Save 16%
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          بطاقة عضوية فاخرة / Premium membership card
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setShowUpgradeDialog(true)}
                  className="bg-amber-600 hover:bg-amber-700 w-full md:w-auto"
                >
                  <Star className="h-4 w-4 mr-2" />
                  ترقية إلى عضوية النخبة / Upgrade to Elite Membership
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  شهادات العملاء / Testimonials
                </CardTitle>
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
        </TabsContent>
        
        {/* Elite Dashboard Tab */}
        <TabsContent value="elite-dashboard">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-500" />
                  لوحة تحكم النخبة / Elite Broker Control Panel
                </h2>
                <p className="text-muted-foreground">
                  نظام متقدم للعمليات التجارية في سوق النفط / Advanced oil market operations system
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 mr-1" /> عضو نخبة / Elite Member
                </Badge>
                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                  تنتهي العضوية / Expires: {formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'MMM yyyy')}
                </Badge>
              </div>
            </div>
            
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 hover:shadow-md transition-shadow border-l-4 border-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">الشحنات النشطة / Active Shipments</p>
                      <h3 className="text-2xl font-bold">14</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+3 since last week</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow border-l-4 border-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">العقود النشطة / Active Contracts</p>
                      <h3 className="text-2xl font-bold">8</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+2 since last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow border-l-4 border-amber-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">المناقصات المتاحة / Open Tenders</p>
                      <h3 className="text-2xl font-bold">23</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-red-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>-5 expiring today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 hover:shadow-md transition-shadow border-l-4 border-purple-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">الرسائل الجديدة / New Messages</p>
                      <h3 className="text-2xl font-bold">7</h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+4 new today</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Elite Member Card */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="bg-gradient-to-br from-amber-600 to-amber-900 p-6 rounded-xl shadow-lg">
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
                    
                    <div className="mt-4 text-sm text-center text-gray-300">
                      تم شحن بطاقة العضوية الفعلية الخاصة بك وستصل في غضون 5-7 أيام عمل.
                    </div>
                    <div className="mt-1 text-sm text-center text-gray-300">
                      Your physical membership card has been dispatched and will arrive in 5-7 business days.
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">حالة النخبة / Elite Status</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Premium Access Level</span>
                          <span className="text-amber-400">8/8</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Exclusive Tenders</span>
                          <span className="text-green-400">Unlimited</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Company Contacts</span>
                          <span>150+</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Direct Messages</span>
                          <span>Unlimited</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-700">
                      <h4 className="text-sm font-medium mb-2">Current Subscription</h4>
                      <div className="flex justify-between text-sm">
                        <span>Annual Elite Membership</span>
                        <span className="text-amber-400">$1,999/year</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Renewal Date</span>
                        <span>{formatDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-white hover:bg-gray-700 mt-2"
                      onClick={() => {
                        toast({
                          title: "عرض تفاصيل العضوية / View Membership Details",
                          description: "Opening membership details and billing information",
                        });
                      }}
                    >
                      عرض تفاصيل العضوية / View Membership Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <label className="block text-sm font-medium mb-1">Business License</label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    {selectedFiles.businessLicense ? (
                      <div className="text-sm">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-1" />
                        <p className="font-medium text-green-600">Uploaded</p>
                        <p className="text-gray-500">{selectedFiles.businessLicense.name}</p>
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
                      onChange={(e) => handleFileChange(e, 'businessLicense')}
                      accept="image/png,image/jpeg,application/pdf"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Photo ID (optional)</label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    {selectedFiles.photoId ? (
                      <div className="text-sm">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-1" />
                        <p className="font-medium text-green-600">Uploaded</p>
                        <p className="text-gray-500">{selectedFiles.photoId.name}</p>
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
                      onChange={(e) => handleFileChange(e, 'photoId')}
                      accept="image/png,image/jpeg,application/pdf"
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
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      الرسالة / Message
                    </Label>
                    <Textarea 
                      id="message" 
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Enter your message"
                      className="min-h-[200px] mt-1.5"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex gap-3">
                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  إلغاء / Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={messageMutation.isPending}
                >
                  {messageMutation.isPending ? (
                    <>جاري الإرسال... / Sending...</>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      إرسال / Send
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}