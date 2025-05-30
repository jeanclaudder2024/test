import React from 'react';

// Import the logo image 
import logoImage from '../../assets/petrodealhub-logo.png';

interface LogoProps {
  height?: number;
  width?: string | number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ height = 36, width = 'auto', className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoImage} 
        alt="PetroDealHub Logo" 
        style={{ height, width }}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;