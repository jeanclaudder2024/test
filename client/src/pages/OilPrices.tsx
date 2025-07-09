import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign, 
  Globe,
  Clock,
  RefreshCw,
  Fuel,
  Activity
} from 'lucide-react';

interface OilPrice {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  lastUpdated: string;
  market: string;
  description: string;
}

interface MarketNews {
  title: string;
  description: string;
  time: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export default function OilPrices() {
  const [prices, setPrices] = useState<OilPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [marketNews, setMarketNews] = useState<MarketNews[]>([]);

  // Simulate real-time oil price data
  const generatePriceData = (): OilPrice[] => {
    const baseTime = new Date().toLocaleTimeString();
    
    return [
      {
        name: 'Brent Crude',
        price: 82.45 + (Math.random() - 0.5) * 2,
        change: -0.32 + (Math.random() - 0.5) * 0.5,
        changePercent: -0.39 + (Math.random() - 0.5) * 0.3,
        unit: 'USD/barrel',
        lastUpdated: baseTime,
        market: 'ICE',
        description: 'International benchmark for oil prices'
      },
      {
        name: 'WTI Crude',
        price: 79.12 + (Math.random() - 0.5) * 2,
        change: 0.45 + (Math.random() - 0.5) * 0.5,
        changePercent: 0.57 + (Math.random() - 0.5) * 0.3,
        unit: 'USD/barrel',
        lastUpdated: baseTime,
        market: 'NYMEX',
        description: 'US crude oil benchmark'
      },
      {
        name: 'Dubai Crude',
        price: 81.78 + (Math.random() - 0.5) * 2,
        change: -0.18 + (Math.random() - 0.5) * 0.5,
        changePercent: -0.22 + (Math.random() - 0.5) * 0.3,
        unit: 'USD/barrel',
        lastUpdated: baseTime,
        market: 'DME',
        description: 'Middle East crude benchmark'
      },
      {
        name: 'Natural Gas',
        price: 2.89 + (Math.random() - 0.5) * 0.2,
        change: 0.12 + (Math.random() - 0.5) * 0.1,
        changePercent: 4.33 + (Math.random() - 0.5) * 2,
        unit: 'USD/MMBtu',
        lastUpdated: baseTime,
        market: 'NYMEX',
        description: 'Henry Hub natural gas'
      },
      {
        name: 'Heating Oil',
        price: 2.45 + (Math.random() - 0.5) * 0.1,
        change: -0.03 + (Math.random() - 0.5) * 0.05,
        changePercent: -1.21 + (Math.random() - 0.5) * 1,
        unit: 'USD/gallon',
        lastUpdated: baseTime,
        market: 'NYMEX',
        description: 'No. 2 heating oil futures'
      },
      {
        name: 'Gasoline',
        price: 2.38 + (Math.random() - 0.5) * 0.1,
        change: 0.07 + (Math.random() - 0.5) * 0.05,
        changePercent: 3.02 + (Math.random() - 0.5) * 1,
        unit: 'USD/gallon',
        lastUpdated: baseTime,
        market: 'NYMEX',
        description: 'RBOB gasoline futures'
      }
    ];
  };

  // Generate market news
  const generateMarketNews = (): MarketNews[] => {
    const newsItems = [
      {
        title: 'OPEC+ Production Cuts Extended',
        description: 'Coalition agrees to maintain current production levels through Q2 2025',
        time: '2 hours ago',
        impact: 'positive' as const
      },
      {
        title: 'US Crude Inventories Rise',
        description: 'Weekly inventory data shows unexpected build in crude stockpiles',
        time: '4 hours ago',
        impact: 'negative' as const
      },
      {
        title: 'Geopolitical Tensions Ease',
        description: 'Diplomatic progress reduces supply disruption concerns',
        time: '6 hours ago',
        impact: 'neutral' as const
      },
      {
        title: 'Refinery Maintenance Season',
        description: 'Spring maintenance programs affect regional product supplies',
        time: '8 hours ago',
        impact: 'positive' as const
      }
    ];
    
    return newsItems;
  };

  // Update prices every 30 seconds
  useEffect(() => {
    const updatePrices = () => {
      setPrices(generatePriceData());
      setLastUpdate(new Date().toLocaleString());
      setLoading(false);
    };

    // Initial load
    updatePrices();
    setMarketNews(generateMarketNews());

    // Set up interval for real-time updates
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshPrices = () => {
    setLoading(true);
    setTimeout(() => {
      setPrices(generatePriceData());
      setLastUpdate(new Date().toLocaleString());
      setLoading(false);
    }, 1000);
  };

  const formatPrice = (price: number) => price.toFixed(2);
  const formatChange = (change: number) => (change >= 0 ? '+' : '') + change.toFixed(2);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Global Oil & Energy Prices
          </h1>
          <p className="text-gray-600">
            Real-time commodity prices and market data
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {lastUpdate}
            </div>
          </div>
          <button
            onClick={refreshPrices}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {prices.map((oil, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold">{oil.name}</CardTitle>
                  <p className="text-sm text-gray-500">{oil.market}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      ${formatPrice(oil.price)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {oil.unit}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {oil.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    oil.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChange(oil.change)} ({oil.changePercent >= 0 ? '+' : ''}{oil.changePercent.toFixed(2)}%)
                  </span>
                </div>
                
                <p className="text-xs text-gray-600">{oil.description}</p>
                
                <div className="text-xs text-gray-400">
                  Updated: {oil.lastUpdated}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Market Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {prices.filter(p => p.change > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Rising</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {prices.filter(p => p.change < 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Falling</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {prices.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Markets</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Key Benchmarks</h4>
                <div className="space-y-2">
                  {prices.slice(0, 3).map((oil, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{oil.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">${formatPrice(oil.price)}</span>
                        <span className={`text-xs ${oil.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatChange(oil.change)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Market News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketNews.map((news, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{news.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        news.impact === 'positive' 
                          ? 'border-green-200 text-green-700 bg-green-50'
                          : news.impact === 'negative'
                          ? 'border-red-200 text-red-700 bg-red-50'
                          : 'border-gray-200 text-gray-700 bg-gray-50'
                      }`}
                    >
                      {news.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{news.description}</p>
                  <div className="text-xs text-gray-400">{news.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          <Globe className="h-4 w-4 inline mr-1" />
          Prices are for informational purposes only and may not reflect real-time market values. 
          Please consult official trading platforms for actual trading prices.
        </p>
      </div>
    </div>
  );
}