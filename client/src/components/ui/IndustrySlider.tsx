import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Factory, Ship, Anchor, MapPin, Calendar, BarChart3 } from 'lucide-react';

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
    description: 'One of the largest refinery complexes in the Middle East, processing crude oil into various petroleum products.',
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
    description: 'Modern Very Large Crude Carrier equipped with advanced navigation and safety systems.',
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
    description: 'Europe\'s largest port and a major hub for petroleum products distribution.',
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
    description: 'Strategic refinery complex operated by Saudi Aramco, processing Arabian crude oil.',
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
    description: 'Suezmax tanker designed for optimal transit through the Suez Canal.',
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
    description: 'World\'s second-largest port by tonnage and major petroleum trading hub.',
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

  // Auto-advance slider
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === industryData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === industryData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? industryData.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative max-w-6xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {industryData.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]">
                {/* Image Side */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className={`${getTypeColor(item.type)} backdrop-blur-sm`}>
                      {getTypeIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </Badge>
                  </div>

                  {/* Location Badge */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline" className="bg-slate-900/80 text-white border-slate-700 backdrop-blur-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.location}
                    </Badge>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-white/70 text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.stats.map((stat, index) => (
                        <div key={index} className="text-center lg:text-left">
                          <div className="text-orange-400 font-bold text-xl">
                            {stat.value}
                          </div>
                          <div className="text-white/60 text-sm">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700/50">
                      {item.capacity && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <BarChart3 className="h-4 w-4" />
                          <span>Capacity: {item.capacity}</span>
                        </div>
                      )}
                      {item.year && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="h-4 w-4" />
                          <span>Since: {item.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm z-10"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm z-10"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 mt-8">
        {industryData.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-orange-500 scale-125' 
                : 'bg-slate-600 hover:bg-slate-500'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-slate-700/30 rounded-full h-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / industryData.length) * 100}%` }}
        />
      </div>

      {/* Type Filter Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        {['refinery', 'vessel', 'port'].map((type) => (
          <Button
            key={type}
            variant="outline"
            className={`${getTypeColor(type)} hover:scale-105 transition-transform`}
            onClick={() => {
              const index = industryData.findIndex(item => item.type === type);
              if (index !== -1) goToSlide(index);
            }}
          >
            {getTypeIcon(type)}
            <span className="ml-2 capitalize">{type}s</span>
          </Button>
        ))}
      </div>
    </div>
  );
}