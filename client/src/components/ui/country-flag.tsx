import { FC } from 'react';
import * as CountryCodeLookup from 'country-code-lookup';
import 'flag-icons/css/flag-icons.min.css';

interface CountryFlagProps {
  countryName: string;
  className?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component to display a country flag icon
 */
export const CountryFlag: FC<CountryFlagProps> = ({ 
  countryName, 
  className = '', 
  showName = false,
  size = 'md'
}) => {
  // Get the ISO code for the country
  let code = '';
  
  try {
    // Handle special cases
    const specialCases: Record<string, string> = {
      'UK': 'GB',
      'USA': 'US',
      'United States': 'US',
      'United Kingdom': 'GB',
      'UAE': 'AE',
      'Russia': 'RU',
      'Korea': 'KR',
      'South Korea': 'KR',
      'North Korea': 'KP',
      'HongKong': 'HK',
      'Hong Kong': 'HK',
      'Taiwan, China': 'TW',
      'Taiwan': 'TW',
      'China, Taiwan': 'TW'
    };
    
    // Check if the country is a special case
    if (specialCases[countryName]) {
      code = specialCases[countryName].toLowerCase();
    } else {
      // Try to lookup the country code
      const result = CountryCodeLookup.byCountry(countryName);
      if (result) {
        code = result.internet.toLowerCase();
      }
    }
  } catch (error) {
    console.error('Error finding country code:', error);
  }

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6'
  };
  
  return (
    <div className="inline-flex items-center gap-2">
      {code ? (
        <span 
          className={`fi fi-${code} ${sizeClasses[size]} ${className}`}
          title={countryName}
        ></span>
      ) : (
        <span className={`${sizeClasses[size]} bg-gray-200 rounded ${className}`} title="Unknown flag"></span>
      )}
      
      {showName && <span>{countryName}</span>}
    </div>
  );
};