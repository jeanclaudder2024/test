import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Factory, Ship, Anchor, MapPin, Calendar, BarChart3, Play, Sparkles, Waves, Zap, Globe } from 'lucide-react';

interface SlideItem {
  id: number;
  type: 'refinery' | 'vessel' | 'port';
  title: string;
  location: string;
  image: string;
  capacity?: string;
  year?: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  color: string;
}

const industryData: SlideItem[] = [
  // Refineries
  {
    id: 1,
    type: 'refinery',
    title: 'Ruwais Refinery Complex',
    location: 'Abu Dhabi, UAE',
    image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '837,000 bpd',
    year: '1981',
    description: 'One of the largest refinery complexes in the Middle East, processing crude oil into various petroleum products with cutting-edge technology.',
    color: 'from-red-500 to-orange-500',
    stats: [
      { label: 'Daily Capacity', value: '837K bpd' },
      { label: 'Location', value: 'UAE' },
      { label: 'Type', value: 'Integrated Complex' }
    ]
  },
  {
    id: 2,
    type: 'vessel',
    title: 'VLCC Atlantic Explorer',
    location: 'Persian Gulf',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '320,000 DWT',
    year: '2019',
    description: 'State-of-the-art Very Large Crude Carrier equipped with advanced navigation systems and environmental protection technology.',
    color: 'from-blue-500 to-cyan-500',
    stats: [
      { label: 'Deadweight', value: '320K DWT' },
      { label: 'Length', value: '330m' },
      { label: 'Status', value: 'Active' }
    ]
  },
  {
    id: 3,
    type: 'port',
    title: 'Port of Rotterdam',
    location: 'Netherlands',
    image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '469M tons/year',
    year: '1872',
    description: 'Europe\'s largest port and a major global hub for petroleum products distribution, connecting continents through maritime trade.',
    color: 'from-green-500 to-emerald-500',
    stats: [
      { label: 'Annual Throughput', value: '469M tons' },
      { label: 'Berths', value: '40+' },
      { label: 'Region', value: 'Europe' }
    ]
  },
  {
    id: 4,
    type: 'refinery',
    title: 'Ras Tanura Refinery',
    location: 'Saudi Arabia',
    image: 'https://images.unsplash.com/photo-1586953983028-5e72ad3d98b8?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '550,000 bpd',
    year: '1945',
    description: 'Strategic refinery complex operated by Saudi Aramco, processing Arabian crude oil with world-class efficiency and sustainability.',
    color: 'from-red-500 to-orange-500',
    stats: [
      { label: 'Daily Capacity', value: '550K bpd' },
      { label: 'Operator', value: 'Saudi Aramco' },
      { label: 'Products', value: '15+ Types' }
    ]
  },
  {
    id: 5,
    type: 'vessel',
    title: 'Suezmax Gulf Navigator',
    location: 'Red Sea',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '158,000 DWT',
    year: '2021',
    description: 'Modern Suezmax tanker designed for optimal transit through the Suez Canal, featuring advanced fuel efficiency systems.',
    color: 'from-blue-500 to-cyan-500',
    stats: [
      { label: 'Deadweight', value: '158K DWT' },
      { label: 'Route', value: 'Suez Transit' },
      { label: 'Flag', value: 'Marshall Islands' }
    ]
  },
  {
    id: 6,
    type: 'port',
    title: 'Port of Singapore',
    location: 'Singapore',
    image: 'https://images.unsplash.com/photo-1566139013297-b41dda0de1d2?w=800&h=600&fit=crop&crop=center&auto=format&q=80',
    capacity: '630M tons/year',
    year: '1819',
    description: 'World\'s second-largest port by tonnage and major petroleum trading hub, connecting Asia-Pacific with global markets.',
    color: 'from-green-500 to-emerald-500',
    stats: [
      { label: 'Annual Volume', value: '630M tons' },
      { label: 'Container Traffic', value: '37M TEU' },
      { label: 'Rank', value: '#2 Global' }
    ]
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'refinery':
      return <Factory className="h-5 w-5" />;
    case 'vessel':
      return <Ship className="h-5 w-5" />;
    case 'port':
      return <Anchor className="h-5 w-5" />;
    default:
      return <Factory className="h-5 w-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'refinery':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    case 'vessel':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'port':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

export default function IndustrySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-advance slider
  useEffect(() => {
    if (isPaused || isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === industryData.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isPaused, isAnimating]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === industryData.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 700);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? industryData.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const currentSlide = industryData[currentIndex];

  return (
    <div 
      className="relative max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${currentSlide.color} rounded-full opacity-20 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Animated Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 C1100,150 1200,50 1200,100 L1200,200 L0,200 Z"
              className={`fill-current text-gradient-to-r ${currentSlide.color} opacity-10 animate-wave`}
            />
            <path
              d="M0,120 C150,220 350,20 500,120 C650,220 850,20 1000,120 C1100,170 1200,70 1200,120 L1200,200 L0,200 Z"
              className={`fill-current text-gradient-to-r ${currentSlide.color} opacity-5 animate-wave-slow`}
            />
          </svg>
        </div>
      </div>

      {/* Main Slider Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-slate-700/50 backdrop-blur-xl shadow-2xl">
        {/* Animated Border Glow */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${currentSlide.color} opacity-20 blur-xl animate-pulse`} />
        <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />
        
        <div className="relative z-10">
          <div 
            className="flex transition-all duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {industryData.map((item, index) => (
              <div key={item.id} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[600px]">
                  {/* Image Side */}
                  <div className="relative overflow-hidden group">
                    {/* Main Image */}
                    <div className="relative h-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`w-full h-full object-cover transition-all duration-1000 ${
                          index === currentIndex ? 'scale-110' : 'scale-100'
                        } group-hover:scale-115`}
                      />
                      
                      {/* Animated Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${
                        index === currentIndex ? 'opacity-100' : 'opacity-60'
                      }`} />
                      
                      {/* Shimmer Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 transition-transform duration-1000 ${
                        index === currentIndex ? 'translate-x-full' : '-translate-x-full'
                      }`} />
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute inset-0">
                      {/* Type Badge with Animation */}
                      <div className={`absolute top-6 left-6 transform transition-all duration-700 ${
                        index === currentIndex ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                      }`}>
                        <Badge variant="outline" className={`${getTypeColor(item.type)} backdrop-blur-md border-2 px-4 py-2 text-sm font-medium animate-bounce-gentle`}>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className="capitalize">{item.type}</span>
                            <Sparkles className="h-3 w-3 animate-spin-slow" />
                          </div>
                        </Badge>
                      </div>

                      {/* Location Badge */}
                      <div className={`absolute bottom-6 left-6 transform transition-all duration-700 delay-200 ${
                        index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}>
                        <Badge variant="outline" className="bg-slate-900/90 text-white border-slate-600 backdrop-blur-md px-4 py-2">
                          <MapPin className="h-4 w-4 mr-2 text-orange-400 animate-pulse" />
                          {item.location}
                        </Badge>
                      </div>

                      {/* Floating Stats */}
                      <div className={`absolute top-1/2 right-6 transform -translate-y-1/2 transition-all duration-700 delay-300 ${
                        index === currentIndex ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                      }`}>
                        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/50">
                          <div className="text-center">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent animate-pulse`}>
                              {item.capacity}
                            </div>
                            <div className="text-xs text-white/60 mt-1">Capacity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className={`w-full h-full bg-gradient-to-br ${item.color} transform rotate-12 scale-150`} />
                    </div>
                    
                    <div className="relative z-10 space-y-8">
                      {/* Title Section */}
                      <div className={`transform transition-all duration-700 delay-100 ${
                        index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${item.color} animate-pulse`}>
                            {getTypeIcon(item.type)}
                          </div>
                          <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10">
                            <Globe className="h-3 w-3 mr-1" />
                            Global Infrastructure
                          </Badge>
                        </div>
                        
                        <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/80 text-lg leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className={`transform transition-all duration-700 delay-300 ${
                        index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}>
                        <div className="grid grid-cols-3 gap-6">
                          {item.stats.map((stat, statIndex) => (
                            <div 
                              key={statIndex} 
                              className={`text-center lg:text-left transform transition-all duration-700`}
                              style={{ transitionDelay: `${400 + statIndex * 100}ms` }}
                            >
                              <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent animate-count-up`}>
                                {stat.value}
                              </div>
                              <div className="text-white/60 text-sm mt-1">
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className={`transform transition-all duration-700 delay-500 ${
                        index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}>
                        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-700/50">
                          {item.capacity && (
                            <div className="flex items-center gap-2 text-sm text-white/70 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/30">
                              <BarChart3 className="h-4 w-4 text-orange-400" />
                              <span>Capacity: {item.capacity}</span>
                            </div>
                          )}
                          {item.year && (
                            <div className="flex items-center gap-2 text-sm text-white/70 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/30">
                              <Calendar className="h-4 w-4 text-orange-400" />
                              <span>Since: {item.year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800/90 border-2 border-slate-700/50 backdrop-blur-md z-20 w-12 h-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          onClick={prevSlide}
          disabled={isAnimating}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-slate-900/90 hover:bg-slate-800/90 border-2 border-slate-700/50 backdrop-blur-md z-20 w-12 h-12 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
          onClick={nextSlide}
          disabled={isAnimating}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="flex justify-center space-x-3 mt-8">
        {industryData.map((item, index) => (
          <button
            key={index}
            className={`relative transition-all duration-500 ${
              index === currentIndex 
                ? 'w-12 h-4' 
                : 'w-4 h-4 hover:w-6'
            }`}
            onClick={() => goToSlide(index)}
            disabled={isAnimating}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              index === currentIndex 
                ? `bg-gradient-to-r ${item.color} shadow-lg` 
                : 'bg-slate-600 hover:bg-slate-500'
            }`} />
            {index === currentIndex && (
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${item.color} animate-ping opacity-75`} />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mt-6 w-full bg-slate-800/50 rounded-full h-2 overflow-hidden backdrop-blur-sm border border-slate-700/30">
        <div 
          className={`h-full bg-gradient-to-r ${currentSlide.color} transition-all duration-700 shadow-lg relative overflow-hidden`}
          style={{ width: `${((currentIndex + 1) / industryData.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Interactive Type Filter Buttons */}
      <div className="flex justify-center gap-4 mt-10">
        {['refinery', 'vessel', 'port'].map((type) => {
          const typeItem = industryData.find(item => item.type === type);
          return (
            <Button
              key={type}
              variant="outline"
              className={`${getTypeColor(type)} hover:scale-105 transition-all duration-300 hover:shadow-xl backdrop-blur-md border-2 px-6 py-3 group relative overflow-hidden`}
              onClick={() => {
                const index = industryData.findIndex(item => item.type === type);
                if (index !== -1) goToSlide(index);
              }}
              disabled={isAnimating}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative flex items-center gap-2">
                {getTypeIcon(type)}
                <span className="capitalize font-medium">{type}s</span>
                <Zap className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes wave {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes wave-slow {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes bounce-gentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes count-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-wave { animation: wave 3s ease-in-out infinite; }
  .animate-wave-slow { animation: wave-slow 4s ease-in-out infinite; }
  .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .animate-count-up { animation: count-up 0.8s ease-out; }
  .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
`;
document.head.appendChild(style);