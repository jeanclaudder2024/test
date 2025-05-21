import React from 'react';

interface RefineryPopupProps {
  refinery: any;
  getRegionFromCountry?: (country: string) => string;
}

const RefineryPopup: React.FC<RefineryPopupProps> = ({ refinery, getRegionFromCountry }) => {
  // If getRegionFromCountry function is not provided, define a basic one
  const determineRegion = getRegionFromCountry || ((country: string): string => {
    const europeCountries = ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Poland', 'Greece'];
    const middleEastCountries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Iraq', 'Iran', 'Oman', 'Bahrain'];
    const asiaCountries = ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand'];
    const northAmericaCountries = ['USA', 'Canada', 'Mexico'];
    
    if (europeCountries.includes(country)) return 'Europe';
    if (middleEastCountries.includes(country)) return 'Middle East';
    if (asiaCountries.includes(country)) return 'Asia-Pacific';
    if (northAmericaCountries.includes(country)) return 'North America';
    
    return 'Global';
  });

  return (
    <div className="refinery-popup-container">
      <div className="popup-header" style={{ 
        background: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
        padding: '12px 16px',
        borderRadius: '6px 6px 0 0',
        marginBottom: '12px',
        marginLeft: '-10px',
        marginRight: '-10px',
        marginTop: '-10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 className="font-bold text-lg text-white m-0">{refinery.name}</h3>
          <p className="text-red-100 text-sm m-0">{refinery.country}</p>
        </div>
        <div className="rounded-full bg-white p-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
            <path d="M10 6h4"></path>
            <path d="M10 10h4"></path>
            <path d="M10 14h4"></path>
            <path d="M10 18h4"></path>
          </svg>
        </div>
      </div>
      
      <div className="popup-content px-2 py-1">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-red-500 font-medium m-0">Region</p>
            <p className="text-sm font-semibold m-0">{refinery.region || determineRegion(refinery.country)}</p>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-red-500 font-medium m-0">Capacity (bpd)</p>
            <p className="text-sm font-semibold m-0">{refinery.capacity?.toLocaleString() || 'Unknown'}</p>
          </div>
        </div>
        
        <div className="bg-red-50 p-3 rounded mb-3">
          <p className="text-xs text-red-500 font-medium mb-1">Operator</p>
          <p className="text-sm font-semibold m-0">{refinery.operator || 'National Oil Company'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-red-500 font-medium m-0">Complexity</p>
            <p className="text-sm font-semibold m-0">{refinery.complexity || 'Medium'}</p>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-red-500 font-medium m-0">Status</p>
            <div className="flex items-center mt-1">
              <div className={`h-2 w-2 rounded-full mr-2 ${refinery.status === 'Offline' ? 'bg-red-500' : refinery.status === 'Maintenance' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <span className="text-sm font-medium">{refinery.status || 'Operational'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefineryPopup;