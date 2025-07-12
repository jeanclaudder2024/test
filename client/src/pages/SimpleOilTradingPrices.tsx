import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock,
  Target,
  Calculator,
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

export default function SimpleOilTradingPrices() {
  const [oilPrices, setOilPrices] = useState<OilPrice[]>([]);
  const [marketNews, setMarketNews] = useState<MarketNews[]>([]);
  const [tradingOpportunities, setTradingOpportunities] = useState<TradingOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  
  // Calculator states
  const [calculatorData, setCalculatorData] = useState({
    quantity: '',
    buyPrice: '',
    sellPrice: '',
    leverage: '1'
  });

  const { toast } = useToast();

  // Comprehensive oil types data
  const sampleOilPrices: OilPrice[] = [
    {
      id: '1',
      name: 'Brent Crude Oil',
      symbol: 'BRENT',
      price: 82.45,
      change: 1.23,
      changePercent: 1.52,
      volume: 145000,
      high24h: 83.12,
      low24h: 81.05,
      exchange: 'ICE',
      unit: 'USD/barrel',
      lastUpdated: new Date().toISOString(),
      description: 'North Sea Brent Crude Oil futures'
    },
    {
      id: '2',
      name: 'WTI Crude Oil',
      symbol: 'WTI',
      price: 78.92,
      change: -0.45,
      changePercent: -0.57,
      volume: 198000,
      high24h: 79.88,
      low24h: 78.12,
      exchange: 'NYMEX',
      unit: 'USD/barrel',
      lastUpdated: new Date().toISOString(),
      description: 'West Texas Intermediate Crude Oil'
    },
    {
      id: '3',
      name: 'Dubai Crude',
      symbol: 'DUBAI',
      price: 80.15,
      change: 0.78,
      changePercent: 0.98,
      volume: 67000,
      high24h: 80.95,
      low24h: 79.45,
      exchange: 'DME',
      unit: 'USD/barrel',
      lastUpdated: new Date().toISOString(),
      description: 'Dubai Crude Oil benchmark'
    },
    {
      id: '4',
      name: 'Oman Crude',
      symbol: 'OMAN',
      price: 79.85,
      change: -0.32,
      changePercent: -0.40,
      volume: 45000,
      high24h: 80.78,
      low24h: 79.22,
      exchange: 'DME',
      unit: 'USD/barrel',
      lastUpdated: new Date().toISOString(),
      description: 'Oman Crude Oil futures'
    },
    {
      id: '5',
      name: 'Natural Gas',
      symbol: 'NG',
      price: 2.845,
      change: 0.089,
      changePercent: 3.23,
      volume: 89000,
      high24h: 2.892,
      low24h: 2.756,
      exchange: 'NYMEX',
      unit: 'USD/MMBtu',
      lastUpdated: new Date().toISOString(),
      description: 'Natural Gas futures'
    },
    {
      id: '6',
      name: 'Gasoline RBOB',
      symbol: 'RB',
      price: 2.123,
      change: 0.045,
      changePercent: 2.16,
      volume: 78000,
      high24h: 2.156,
      low24h: 2.089,
      exchange: 'NYMEX',
      unit: 'USD/gallon',
      lastUpdated: new Date().toISOString(),
      description: 'Reformulated Blendstock for Oxygenate Blending'
    },
    {
      id: '7',
      name: 'Heating Oil',
      symbol: 'HO',
      price: 2.456,
      change: 0.034,
      changePercent: 1.41,
      volume: 45000,
      high24h: 2.478,
      low24h: 2.422,
      exchange: 'NYMEX',
      unit: 'USD/gallon',
      lastUpdated: new Date().toISOString(),
      description: 'Heating Oil futures'
    },
    {
      id: '8',
      name: 'Jet Fuel',
      symbol: 'JET',
      price: 2.678,
      change: -0.021,
      changePercent: -0.78,
      volume: 32000,
      high24h: 2.712,
      low24h: 2.645,
      exchange: 'ICE',
      unit: 'USD/gallon',
      lastUpdated: new Date().toISOString(),
      description: 'Jet Fuel (Kerosene) futures'
    },
    {
      id: '9',
      name: 'Diesel Fuel',
      symbol: 'ULSD',
      price: 2.534,
      change: 0.067,
      changePercent: 2.71,
      volume: 56000,
      high24h: 2.578,
      low24h: 2.489,
      exchange: 'NYMEX',
      unit: 'USD/gallon',
      lastUpdated: new Date().toISOString(),
      description: 'Ultra Low Sulfur Diesel'
    },
    {
      id: '10',
      name: 'Naphtha',
      symbol: 'NAPH',
      price: 645.50,
      change: 12.30,
      changePercent: 1.94,
      volume: 28000,
      high24h: 652.80,
      low24h: 638.90,
      exchange: 'PLATTS',
      unit: 'USD/ton',
      lastUpdated: new Date().toISOString(),
      description: 'Naphtha CIF NWE (Platts)'
    },
    {
      id: '11',
      name: 'Fuel Oil 380',
      symbol: 'FO380',
      price: 425.75,
      change: -8.45,
      changePercent: -1.95,
      volume: 34000,
      high24h: 438.20,
      low24h: 422.10,
      exchange: 'PLATTS',
      unit: 'USD/ton',
      lastUpdated: new Date().toISOString(),
      description: 'Fuel Oil 380 CST FOB Singapore'
    },
    {
      id: '12',
      name: 'LPG Propane',
      symbol: 'LPG',
      price: 1.234,
      change: 0.089,
      changePercent: 7.78,
      volume: 19000,
      high24h: 1.267,
      low24h: 1.198,
      exchange: 'NYMEX',
      unit: 'USD/gallon',
      lastUpdated: new Date().toISOString(),
      description: 'Liquefied Petroleum Gas - Propane'
    }
  ];

  const sampleMarketNews: MarketNews[] = [
    {
      id: '1',
      headline: 'OPEC+ Considers Production Cut Extension',
      summary: 'OPEC+ is discussing extending current production cuts through Q2 2025 to support oil prices.',
      impact: 'positive',
      timestamp: new Date().toISOString(),
      source: 'Reuters',
      relevantCommodities: ['BRENT', 'WTI']
    },
    {
      id: '2',
      headline: 'US Crude Inventories Rise More Than Expected',
      summary: 'Weekly inventory data shows unexpected build in crude stocks, putting pressure on prices.',
      impact: 'negative',
      timestamp: new Date().toISOString(),
      source: 'EIA',
      relevantCommodities: ['WTI']
    }
  ];

  const sampleTradingOpportunities: TradingOpportunity[] = [
    {
      id: '1',
      type: 'buy',
      commodity: 'Brent Crude',
      currentPrice: 82.45,
      targetPrice: 88.00,
      confidence: 75,
      timeframe: '2-3 weeks',
      reasoning: 'Technical indicators suggest upward momentum with strong support at $81.',
      risk: 'medium'
    },
    {
      id: '2',
      type: 'sell',
      commodity: 'Natural Gas',
      currentPrice: 2.845,
      targetPrice: 2.650,
      confidence: 68,
      timeframe: '1-2 weeks',
      reasoning: 'Weather forecasts indicate warmer temperatures reducing heating demand.',
      risk: 'low'
    },
    {
      id: '3',
      type: 'buy',
      commodity: 'Dubai Crude',
      currentPrice: 80.15,
      targetPrice: 84.50,
      confidence: 72,
      timeframe: '3-4 weeks',
      reasoning: 'Asian demand recovering with strong refinery margins supporting prices.',
      risk: 'medium'
    },
    {
      id: '4',
      type: 'hold',
      commodity: 'Gasoline RBOB',
      currentPrice: 2.123,
      targetPrice: 2.200,
      confidence: 65,
      timeframe: '2-3 weeks',
      reasoning: 'Driving season approaching but refinery capacity increases may limit gains.',
      risk: 'low'
    },
    {
      id: '5',
      type: 'buy',
      commodity: 'Diesel Fuel',
      currentPrice: 2.534,
      targetPrice: 2.750,
      confidence: 80,
      timeframe: '1-2 weeks',
      reasoning: 'Strong industrial demand and low inventory levels supporting price increases.',
      risk: 'medium'
    },
    {
      id: '6',
      type: 'sell',
      commodity: 'Fuel Oil 380',
      currentPrice: 425.75,
      targetPrice: 395.00,
      confidence: 70,
      timeframe: '2-4 weeks',
      reasoning: 'IMO 2020 regulations reducing demand for high sulfur fuel oil.',
      risk: 'medium'
    }
  ];

  // Fetch oil prices data
  const updateData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/oil-prices/live');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.prices && data.prices.length > 0) {
          setOilPrices(data.prices);
        } else {
          // Use sample data if no real data available
          setOilPrices(sampleOilPrices);
        }
      } else {
        setOilPrices(sampleOilPrices);
      }
      setMarketNews(sampleMarketNews);
      setTradingOpportunities(sampleTradingOpportunities);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching oil prices:', error);
      setOilPrices(sampleOilPrices);
      setMarketNews(sampleMarketNews);
      setTradingOpportunities(sampleTradingOpportunities);
      toast({
        title: "Connection Error",
        description: "Using demo data. Check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data and set up refresh every 25 hours
  useEffect(() => {
    updateData();
    
    // Auto-refresh every 25 hours (90,000,000 milliseconds)
    const interval = setInterval(updateData, 90000000);
    return () => clearInterval(interval);
  }, []);

  // Filter prices based on selected commodity
  const filteredPrices = selectedCommodity === 'all' 
    ? oilPrices 
    : oilPrices.filter(price => {
        const symbol = price.symbol.toLowerCase();
        const name = price.name.toLowerCase();
        
        switch(selectedCommodity) {
          case 'crude':
            return ['brent', 'wti', 'dubai', 'oman'].some(crude => symbol.includes(crude) || name.includes(crude));
          case 'gas':
            return ['ng', 'lpg', 'gas', 'propane'].some(gas => symbol.includes(gas) || name.includes(gas));
          case 'refined':
            return ['rb', 'ulsd', 'jet', 'gasoline', 'diesel'].some(refined => symbol.includes(refined) || name.includes(refined));
          case 'heavy':
            return ['fo380', 'naph', 'fuel oil', 'naphtha'].some(heavy => symbol.includes(heavy) || name.includes(heavy));
          case 'heating':
            return ['ho', 'lpg', 'heating', 'propane'].some(heating => symbol.includes(heating) || name.includes(heating));
          default:
            return true;
        }
      });

  // Calculate profit/loss
  const calculateProfitLoss = () => {
    const quantity = parseFloat(calculatorData.quantity) || 0;
    const buyPrice = parseFloat(calculatorData.buyPrice) || 0;
    const sellPrice = parseFloat(calculatorData.sellPrice) || 0;
    const leverage = parseFloat(calculatorData.leverage) || 1;

    const profit = (sellPrice - buyPrice) * quantity * leverage;
    const profitPercent = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 * leverage : 0;

    return { profit, profitPercent };
  };

  const calculations = calculateProfitLoss();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Oil Trading Prices</h1>
            <p className="text-slate-600 mt-1">
              Real-time market data and trading opportunities
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Prices</span>
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
                        <SelectItem value="crude">Crude Oil (Brent, WTI, Dubai, Oman)</SelectItem>
                        <SelectItem value="gas">Natural Gas & LPG</SelectItem>
                        <SelectItem value="refined">Refined Products (Gasoline, Diesel, Jet Fuel)</SelectItem>
                        <SelectItem value="heavy">Heavy Products (Fuel Oil, Naphtha)</SelectItem>
                        <SelectItem value="heating">Heating & Energy (Heating Oil, Propane)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrices.map((price) => (
                    <div key={price.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <h3 className="font-semibold">{price.name}</h3>
                          <p className="text-sm text-slate-600">{price.symbol} • {price.exchange}</p>
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold">{price.price} {price.unit}</p>
                          <div className="flex items-center gap-2 mt-1">
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

          {/* Trading Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tradingOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        {opportunity.commodity}
                      </div>
                      <Badge 
                        variant={opportunity.type === 'buy' ? 'default' : opportunity.type === 'sell' ? 'destructive' : 'secondary'}
                        className={`uppercase text-xs ${
                          opportunity.type === 'buy' ? 'bg-green-100 text-green-800' : 
                          opportunity.type === 'sell' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {opportunity.type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Current Price</p>
                        <p className="font-semibold">${opportunity.currentPrice}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Target Price</p>
                        <p className="font-semibold text-green-600">${opportunity.targetPrice}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Confidence</p>
                        <p className="font-semibold">{opportunity.confidence}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Risk Level</p>
                        <Badge 
                          variant="outline" 
                          className={`${
                            opportunity.risk === 'low' ? 'text-green-600' : 
                            opportunity.risk === 'medium' ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}
                        >
                          {opportunity.risk.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-slate-600 mb-2">Time Frame</p>
                      <p className="font-semibold">{opportunity.timeframe}</p>
                      
                      <p className="text-sm text-slate-600 mt-3 mb-2">Reasoning</p>
                      <p className="text-sm text-slate-700">{opportunity.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profit Calculator */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Trading Profit Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quantity">Quantity (barrels/units)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={calculatorData.quantity}
                        onChange={(e) => setCalculatorData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="1000"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="buyPrice">Buy Price ($)</Label>
                      <Input
                        id="buyPrice"
                        type="number"
                        step="0.01"
                        value={calculatorData.buyPrice}
                        onChange={(e) => setCalculatorData(prev => ({ ...prev, buyPrice: e.target.value }))}
                        placeholder="80.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sellPrice">Sell Price ($)</Label>
                      <Input
                        id="sellPrice"
                        type="number"
                        step="0.01"
                        value={calculatorData.sellPrice}
                        onChange={(e) => setCalculatorData(prev => ({ ...prev, sellPrice: e.target.value }))}
                        placeholder="85.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="leverage">Leverage</Label>
                      <Select value={calculatorData.leverage} onValueChange={(value) => setCalculatorData(prev => ({ ...prev, leverage: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1:1 (No Leverage)</SelectItem>
                          <SelectItem value="5">1:5</SelectItem>
                          <SelectItem value="10">1:10</SelectItem>
                          <SelectItem value="20">1:20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Calculation Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Profit/Loss:</span>
                          <span className={`font-semibold ${calculations.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${calculations.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit/Loss %:</span>
                          <span className={`font-semibold ${calculations.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {calculations.profitPercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Leverage Used:</span>
                          <span className="font-semibold">{calculatorData.leverage}:1</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Risk Warning</h4>
                      <p className="text-sm text-yellow-700">
                        Trading with leverage increases both potential profits and losses. 
                        Never risk more than you can afford to lose.
                      </p>
                    </div>
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
                  Market News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketNews.map((news) => (
                    <div key={news.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{news.headline}</h3>
                          <p className="text-sm text-slate-600 mb-3">{news.summary}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{new Date(news.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={`${
                            news.impact === 'positive' ? 'text-green-600 border-green-300' :
                            news.impact === 'negative' ? 'text-red-600 border-red-300' :
                            'text-gray-600 border-gray-300'
                          }`}
                        >
                          {news.impact}
                        </Badge>
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