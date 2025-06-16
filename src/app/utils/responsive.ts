/**
 * Responsive design utilities for consistent cross-device compatibility
 */

import React from 'react';

export interface ResponsiveBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export const breakpoints: ResponsiveBreakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Get responsive class names for grid layouts
 */
export const getResponsiveGridClasses = (
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  large: number = 4
): string => {
  return `grid-cols-${mobile} sm:grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${large}`;
};

/**
 * Get responsive padding classes
 */
export const getResponsivePadding = (
  mobile: string = 'p-4',
  tablet: string = 'md:p-6',
  desktop: string = 'lg:p-8'
): string => {
  return `${mobile} ${tablet} ${desktop}`;
};

/**
 * Get responsive text size classes
 */
export const getResponsiveText = (
  mobile: string = 'text-sm',
  tablet: string = 'md:text-base',
  desktop: string = 'lg:text-lg'
): string => {
  return `${mobile} ${tablet} ${desktop}`;
};

/**
 * Get responsive margin classes
 */
export const getResponsiveMargin = (
  mobile: string = 'm-2',
  tablet: string = 'md:m-4',
  desktop: string = 'lg:m-6'
): string => {
  return `${mobile} ${tablet} ${desktop}`;
};

/**
 * Get responsive gap classes for flex/grid layouts
 */
export const getResponsiveGap = (
  mobile: string = 'gap-2',
  tablet: string = 'md:gap-4',
  desktop: string = 'lg:gap-6'
): string => {
  return `${mobile} ${tablet} ${desktop}`;
};

/**
 * Get responsive container classes
 */
export const getResponsiveContainer = (): string => {
  return 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
};

/**
 * Get responsive card classes
 */
export const getResponsiveCard = (): string => {
  return 'rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6 lg:p-8';
};

/**
 * Get responsive button classes
 */
export const getResponsiveButton = (size: 'sm' | 'md' | 'lg' = 'md'): string => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base md:px-6 md:py-3',
    lg: 'px-6 py-3 text-lg md:px-8 md:py-4'
  };
  
  return `${sizeClasses[size]} rounded-md font-medium transition-colors duration-200`;
};

/**
 * Check if device is mobile based on window width
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Check if device is tablet based on window width
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Check if device is desktop based on window width
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

/**
 * Get current device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Hook for responsive design
 */
export const useResponsive = () => {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getDeviceType();
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType
  };
};

 