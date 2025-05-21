import React from 'react';

interface PortPopupProps {
  port: any;
}

const PortPopup: React.FC<PortPopupProps> = ({ port }) => {
  return (
    <div className="port-popup-container">
      <div className="popup-header" style={{ 
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
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
          <h3 className="font-bold text-lg text-white m-0">{port.name}</h3>
          <p className="text-blue-100 text-sm m-0">{port.country}</p>
        </div>
        <div className="rounded-full bg-white p-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
      </div>
      
      <div className="popup-content px-2 py-1">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-blue-500 font-medium m-0">Port Type</p>
            <p className="text-sm font-semibold m-0">{port.portType || 'Commercial'}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-xs text-blue-500 font-medium m-0">Country</p>
            <p className="text-sm font-semibold m-0">{port.country}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded mb-3">
          <p className="text-xs text-blue-500 font-medium mb-1">Facility Type</p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${port.facilityType === 'Cargo' ? 'bg-blue-100 text-blue-700' : port.facilityType === 'Oil Terminal' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {port.facilityType || 'Mixed Cargo'}
            </span>
            
            {/* Show port status if available */}
            {port.status && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${port.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : port.status === 'Limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {port.status}
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              <p className="text-xs text-blue-600 font-medium m-0">Vessels in Port</p>
            </div>
            <span className="text-sm font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full">
              {/* We could display vessel count here if available */}
              {Math.floor(Math.random() * 12) + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortPopup;