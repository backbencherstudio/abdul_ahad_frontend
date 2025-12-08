/**
 * Vehicle Helper - Utility functions for vehicle-related operations
 */

/**
 * Get brand logo URL based on vehicle make
 * @param make - Vehicle make (e.g., "FORD", "MERCEDES-BENZ", "BMW")
 * @returns Logo URL or default placeholder
 */
export const getBrandLogo = (make: string): string => {
  const makeUpper = make?.toUpperCase() || '';
  
  // Brand logo mapping - you can add more brands as needed
  const brandLogos: Record<string, string> = {
    'FORD': 'https://i.ibb.co/PGwBJx13/pngegg-2-1.png',
    'MERCEDES-BENZ': 'https://i.ibb.co/example/mercedes-logo.png',
    'BMW': 'https://i.ibb.co/example/bmw-logo.png',
    'TOYOTA': 'https://i.ibb.co/Rp0BJdNZ/pngegg-1.png',
    'AUDI': 'https://i.ibb.co/example/audi-logo.png',
    'VOLKSWAGEN': 'https://i.ibb.co/example/vw-logo.png',
    'HONDA': 'https://i.ibb.co/example/honda-logo.png',
    'NISSAN': 'https://i.ibb.co/example/nissan-logo.png',
    'HYUNDAI': 'https://i.ibb.co/example/hyundai-logo.png',
    'KIA': 'https://i.ibb.co/example/kia-logo.png',
  };

  // Return logo if found, otherwise return a default placeholder
  return brandLogos[makeUpper] || 'https://i.ibb.co/PGwBJx13/pngegg-2-1.png';
};
