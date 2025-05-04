/**
 * Maps country names to their respective regions for the oil companies feature
 */

// Define a mapping of countries to regions
const COUNTRY_REGION_MAP: Record<string, string> = {
  // Middle East
  'Saudi Arabia': 'Middle East',
  'Iran': 'Middle East',
  'Iraq': 'Middle East',
  'Kuwait': 'Middle East',
  'UAE': 'Middle East',
  'United Arab Emirates': 'Middle East',
  'Qatar': 'Middle East',
  'Oman': 'Middle East',
  'Bahrain': 'Middle East',
  'Yemen': 'Middle East',
  'Israel': 'Middle East',
  'Jordan': 'Middle East',
  'Lebanon': 'Middle East',
  'Syria': 'Middle East',

  // North Africa
  'Egypt': 'North Africa',
  'Algeria': 'North Africa',
  'Libya': 'North Africa',
  'Tunisia': 'North Africa',
  'Morocco': 'North Africa',
  'Sudan': 'North Africa',

  // Southern Africa
  'South Africa': 'Southern Africa',
  'Nigeria': 'Southern Africa',
  'Angola': 'Southern Africa',
  'Ghana': 'Southern Africa',
  'Kenya': 'Southern Africa',
  'Tanzania': 'Southern Africa',

  // Russia (as its own region)
  'Russia': 'Russia',

  // China (as its own region)
  'China': 'China',

  // Asia & Pacific
  'India': 'Asia-Pacific',
  'Pakistan': 'Asia-Pacific',
  'Bangladesh': 'Asia-Pacific',
  'Sri Lanka': 'Asia-Pacific',
  'Nepal': 'Asia-Pacific',
  'Bhutan': 'Asia-Pacific',
  'Myanmar': 'Asia-Pacific',
  'Afghanistan': 'Asia-Pacific',

  // Southeast Asia & Oceania
  'Japan': 'Southeast Asia & Oceania',
  'South Korea': 'Southeast Asia & Oceania',
  'North Korea': 'Southeast Asia & Oceania',
  'Taiwan': 'Southeast Asia & Oceania',
  'Philippines': 'Southeast Asia & Oceania',
  'Indonesia': 'Southeast Asia & Oceania',
  'Malaysia': 'Southeast Asia & Oceania',
  'Singapore': 'Southeast Asia & Oceania',
  'Thailand': 'Southeast Asia & Oceania',
  'Vietnam': 'Southeast Asia & Oceania',
  'Cambodia': 'Southeast Asia & Oceania',
  'Laos': 'Southeast Asia & Oceania',
  'Australia': 'Southeast Asia & Oceania',
  'New Zealand': 'Southeast Asia & Oceania',

  // Western Europe
  'United Kingdom': 'Western Europe',
  'UK': 'Western Europe',
  'France': 'Western Europe',
  'Germany': 'Western Europe',
  'Italy': 'Western Europe',
  'Spain': 'Western Europe',
  'Portugal': 'Western Europe',
  'Belgium': 'Western Europe',
  'Netherlands': 'Western Europe',
  'Switzerland': 'Western Europe',
  'Austria': 'Western Europe',
  'Ireland': 'Western Europe',
  'Denmark': 'Western Europe',
  'Sweden': 'Western Europe',
  'Norway': 'Western Europe',
  'Finland': 'Western Europe',
  'Iceland': 'Western Europe',
  'Greece': 'Western Europe',

  // Eastern Europe
  'Poland': 'Eastern Europe',
  'Czech Republic': 'Eastern Europe',
  'Slovakia': 'Eastern Europe',
  'Hungary': 'Eastern Europe',
  'Romania': 'Eastern Europe',
  'Bulgaria': 'Eastern Europe',
  'Serbia': 'Eastern Europe',
  'Croatia': 'Eastern Europe',
  'Slovenia': 'Eastern Europe',
  'Ukraine': 'Eastern Europe',
  'Belarus': 'Eastern Europe',
  'Estonia': 'Eastern Europe',
  'Latvia': 'Eastern Europe',
  'Lithuania': 'Eastern Europe',
  'Turkey': 'Eastern Europe',

  // North America
  'United States': 'North America',
  'USA': 'North America',
  'US': 'North America',
  'Canada': 'North America',

  // Central America
  'Mexico': 'Central America',
  'Panama': 'Central America',
  'Costa Rica': 'Central America',
  'Guatemala': 'Central America',
  'Honduras': 'Central America',
  'Nicaragua': 'Central America',
  'El Salvador': 'Central America',
  'Belize': 'Central America',
  'Jamaica': 'Central America',
  'Cuba': 'Central America',
  'Haiti': 'Central America',
  'Dominican Republic': 'Central America',
  'Trinidad and Tobago': 'Central America',

  // South America
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Colombia': 'South America',
  'Venezuela': 'South America',
  'Peru': 'South America',
  'Ecuador': 'South America',
  'Bolivia': 'South America',
  'Paraguay': 'South America',
  'Uruguay': 'South America',
};

/**
 * Gets the region for a country
 * @param country Country name
 * @returns Region name or default region if country not found
 */
export function getRegionForCountry(country: string): string {
  if (!country) return 'Unknown';
  
  // Try direct match
  const region = COUNTRY_REGION_MAP[country];
  if (region) return region;
  
  // Try case-insensitive match
  const countryLower = country.toLowerCase();
  const matchedCountry = Object.keys(COUNTRY_REGION_MAP).find(
    (key) => key.toLowerCase() === countryLower
  );
  
  if (matchedCountry) {
    return COUNTRY_REGION_MAP[matchedCountry];
  }
  
  // Default region if no match found
  return 'Unknown';
}

/**
 * Gets all available regions
 * @returns Array of unique region names
 */
export function getAllRegions(): string[] {
  return [...new Set(Object.values(COUNTRY_REGION_MAP))].sort();
}

/**
 * Gets all countries in a specific region
 * @param region Region name
 * @returns Array of country names in the specified region
 */
export function getCountriesInRegion(region: string): string[] {
  if (!region) return [];
  
  return Object.entries(COUNTRY_REGION_MAP)
    .filter(([_, r]) => r === region)
    .map(([country, _]) => country)
    .sort();
}