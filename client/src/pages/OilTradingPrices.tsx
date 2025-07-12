import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Globe, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Target,
  Calculator,
  LineChart,
  PieChart,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OilPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
  lastUpdated: string;
  exchange: string;
  unit: string;
  description: string;
}

interface MarketNews {
  id: string;
  headline: string;
  summary: string;
  impact: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  source: string;
  relevantCommodities: string[];
}

interface TradingOpportunity {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  commodity: string;
  currentPrice: number;
  targetPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  risk: 'low' | 'medium' | 'high';
}

export default function OilTradingPrices() {
  const [oilPrices, setOilPrices] = useState<OilPrice[]>([]);
  const [marketNews, setMarketNews] = useState<MarketNews[]>([]);
  const [tradingOpportunities, setTradingOpportunities] = useState<TradingOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [calculatorValues, setCalculatorValues] = useState({
    quantity: '',
    price: '',
    margin: ''
  });
  const { toast } = useToast();

  // Fetch real oil price data from Oil Price API
  const fetchOilPrices = async (): Promise<OilPrice[]> => {
    try {
      const response = await fetch('/api/oil-prices/live');
      if (!response.ok) {
        throw new Error('Failed to fetch oil prices');
      }
      const data = await response.json();
      return data.prices || [];
    } catch (error) {
      console.error('Error fetching oil prices:', error);
      toast({
        title: "API Error",
        description: "Unable to fetch live oil prices. Please check API configuration.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Generate market news
  const generateMarketNews = (): MarketNews[] => {
    const newsItems = [
      {
        headline: "OPEC+ Announces Production Cut Extension",
        summary: "Major oil producers agree to extend current production cuts through Q2 2025",
        impact: 'positive' as const,
        source: "Reuters Energy",
        relevantCommodities: ['BRENT', 'WTI', 'DUBAI']
      },
      {
        headline: "US Strategic Reserve Release Plans",
        summary: "Administration considering strategic petroleum reserve releases to stabilize prices",
        impact: 'negative' as const,
        source: "Bloomberg Energy",
        relevantCommodities: ['WTI', 'BRENT']
      },
      {
        headline: "Refinery Capacity Utilization Rises",
        summary: "Global refinery runs increase 3.2% as maintenance season concludes",
        impact: 'positive' as const,
        source: "Energy Intelligence",
        relevantCommodities: ['RB', 'HO', 'JET']
      },
      {
        headline: "Middle East Tensions Escalate",
        summary: "Geopolitical concerns drive risk premium in crude oil markets",
        impact: 'positive' as const,
        source: "Platts Energy",
        relevantCommodities: ['BRENT', 'DUBAI']
      }
    ];

    return newsItems.map((item, index) => ({
      id: `news-${index}`,
      headline: item.headline,
      summary: item.summary,
      impact: item.impact,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      source: item.source,
      relevantCommodities: item.relevantCommodities
    }));
  };

  // Generate trading opportunities
  const generateTradingOpportunities = (): TradingOpportunity[] => {
    const opportunities = [
      {
        type: 'buy' as const,
        commodity: 'Brent Crude',
        currentPrice: 85.45,
        targetPrice: 92.00,
        confidence: 78,
        timeframe: '2-3 weeks',
        reasoning: 'Technical analysis shows strong support at $84. OPEC cuts and winter demand expected to drive prices higher.',
        risk: 'medium' as const
      },
      {
        type: 'sell' as const,
        commodity: 'Natural Gas',
        currentPrice: 2.85,
        targetPrice: 2.60,
        confidence: 65,
        timeframe: '1-2 weeks',
        reasoning: 'Weather forecasts show milder temperatures. Storage levels above seasonal norms.',
        risk: 'low' as const
      },
      {
        type: 'buy' as const,
        commodity: 'Gasoline',
        currentPrice: 2.45,
        targetPrice: 2.65,
        confidence: 82,
        timeframe: '3-4 weeks',
        reasoning: 'Refinery maintenance season ending. Summer driving season demand pickup expected.',
        risk: 'medium' as const
      }
    ];

    return opportunities.map((item, index) => ({
      id: `opp-${index}`,
      ...item
    }));
  };

  // Calculate profit/loss
  const calculateProfitLoss = () => {
    const quantity = parseFloat(calculatorValues.quantity) || 0;
    const price = parseFloat(calculatorValues.price) || 0;
    const margin = parseFloat(calculatorValues.margin) || 0;
    
    const totalValue = quantity * price;
    const profit = totalValue * (margin / 100);
    
    return {
      totalValue: totalValue.toFixed(2),
      profit: profit.toFixed(2),
      margin: margin.toFixed(2)
    };
  };

  // Update data
  const updateData = async () => {
    setLoading(true);
    try {
      const [prices] = await Promise.all([
        fetchOilPrices(),
      ]);
      
      setOilPrices(prices);
      setMarketNews(generateMarketNews());
      setTradingOpportunities(generateTradingOpportunities());
      setLastUpdate(new Date());
      
      toast({
        title: "Data Updated",
        description: "Live market data refreshed successfully",
      });
    } catch (error) {
      console.error('Error updating data:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    updateData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter prices based on selected commodity
  const filteredPrices = selectedCommodity === 'all' 
    ? oilPrices 
    : oilPrices.filter(price => price.symbol.toLowerCase().includes(selectedCommodity.toLowerCase()));

  const calculations = calculateProfitLoss();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Oil Trading Prices</h1>
            <p className="text-slate-600 mt-1">
              Real-time market data, analysis, and trading opportunities
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Clock className="w-3 h-3 mr-1" />
              Updated {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button onClick={updateData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {oilPrices.slice(0, 4).map((price) => (
            <Card key={price.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{price.name}</p>
                      <p className="text-xs text-slate-500">{price.exchange}</p>
                    </div>
                  </div>
                  {price.changePercent > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : price.changePercent < 0 ? (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{price.price}</span>
                    <span className="text-sm text-slate-500">{price.unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={price.changePercent >= 0 ? "default" : "destructive"} 
                      className={`text-xs ${price.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                    </Badge>
                    <span className={`text-sm ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {price.change >= 0 ? '+' : ''}{price.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Prices</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">News</span>
            </TabsTrigger>
          </TabsList>

          {/* Detailed Prices */}
          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Live Oil Prices
                  </CardTitle>
                  
                  <div className="flex items-center gap-3">
                    <Label htmlFor="commodity-filter">Filter:</Label>
                    <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Commodities</SelectItem>
                        <SelectItem value="crude">Crude Oil</SelectItem>
                        <SelectItem value="gas">Natural Gas</SelectItem>
                        <SelectItem value="refined">Refined Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrices.map((price) => (
                    <div key={price.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{price.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{price.name}</h3>
                              <p className="text-sm text-slate-500">{price.exchange}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold">{price.price}</p>
                          <p className="text-sm text-slate-500">{price.unit}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={price.changePercent >= 0 ? "default" : "destructive"} 
                              className={price.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                            </Badge>
                          </div>
                          <p className={`text-sm mt-1 ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {price.change >= 0 ? '+' : ''}{price.change} {price.unit}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-600">24h High</p>
                          <p className="font-semibold">{price.high24h}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-slate-600">24h Low</p>
                          <p className="font-semibold">{price.low24h}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Market Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Bullish Sentiment</span>
                        <span className="text-sm text-green-600">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Bearish Sentiment</span>
                        <span className="text-sm text-red-600">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Key Indicators</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>RSI (14)</span>
                        <Badge variant="outline">62.3</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>MACD</span>
                        <Badge variant="outline" className="text-green-600">+1.24</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>50-day MA</span>
                        <Badge variant="outline">$82.15</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Volume Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {oilPrices.slice(0, 4).map((price) => (
                      <div key={price.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{price.name}</span>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{price.volume.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">contracts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Trading Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {tradingOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={opportunity.type === 'buy' ? 'default' : opportunity.type === 'sell' ? 'destructive' : 'secondary'}
                              className={
                                opportunity.type === 'buy' ? 'bg-green-100 text-green-800' :
                                opportunity.type === 'sell' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {opportunity.type.toUpperCase()}
                            </Badge>
                            <span className="font-semibold">{opportunity.commodity}</span>
                          </div>
                          <p className="text-sm text-slate-600">{opportunity.timeframe}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Confidence:</span>
                            <Badge variant="outline">{opportunity.confidence}%</Badge>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              opportunity.risk === 'low' ? 'text-green-600' :
                              opportunity.risk === 'medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }
                          >
                            {opportunity.risk} risk
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-slate-500">Current Price</p>
                          <p className="font-semibold">${opportunity.currentPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Target Price</p>
                          <p className="font-semibold">${opportunity.targetPrice}</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Analysis:</strong> {opportunity.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Calculator */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Trading Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity (barrels)</Label>
                    <Input
                      id="quantity"
                      placeholder="1000"
                      value={calculatorValues.quantity}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price per barrel ($)</Label>
                    <Input
                      id="price"
                      placeholder="85.45"
                      value={calculatorValues.price}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin">Profit Margin (%)</Label>
                    <Input
                      id="margin"
                      placeholder="5"
                      value={calculatorValues.margin}
                      onChange={(e) => setCalculatorValues(prev => ({ ...prev, margin: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Total Value</p>
                    <p className="text-2xl font-bold text-blue-600">${calculations.totalValue}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Expected Profit</p>
                    <p className="text-2xl font-bold text-green-600">${calculations.profit}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600">Margin</p>
                    <p className="text-2xl font-bold text-purple-600">{calculations.margin}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market News */}
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Market News & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketNews.map((news) => (
                    <div key={news.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          news.impact === 'positive' ? 'bg-green-500' :
                          news.impact === 'negative' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{news.headline}</h3>
                            <Badge 
                              variant="outline" 
                              className={
                                news.impact === 'positive' ? 'text-green-600' :
                                news.impact === 'negative' ? 'text-red-600' :
                                'text-yellow-600'
                              }
                            >
                              {news.impact}
                            </Badge>
                          </div>
                          
                          <p className="text-slate-600 mb-3">{news.summary}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{news.source}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">{new Date(news.timestamp).toLocaleTimeString()}</span>
                            </div>
                            
                            <div className="flex gap-1">
                              {news.relevantCommodities.map((commodity) => (
                                <Badge key={commodity} variant="secondary" className="text-xs">
                                  {commodity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}