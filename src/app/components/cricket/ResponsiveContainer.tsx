'use client';

import React from 'react';
import { getResponsiveContainer, getResponsivePadding, useResponsive } from '../../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'md',
  className = ''
}) => {
  const { isMobile } = useResponsive();

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-4xl';
      case 'xl': return 'max-w-6xl';
      case '2xl': return 'max-w-7xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-6xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return getResponsivePadding('p-2', 'md:p-3', 'lg:p-4');
      case 'md': return getResponsivePadding('p-3', 'md:p-4', 'lg:p-6');
      case 'lg': return getResponsivePadding('p-4', 'md:p-6', 'lg:p-8');
      default: return getResponsivePadding('p-3', 'md:p-4', 'lg:p-6');
    }
  };

  return (
    <div className={`w-full ${getMaxWidthClass()} mx-auto ${getPaddingClass()} ${className}`}>
      {children}
    </div>
  );
};

// Additional responsive layout components

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md',
  className = ''
}) => {
  const { mobile = 1, tablet = 2, desktop = 3, large = 4 } = cols;
  
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2 md:gap-3';
      case 'md': return 'gap-3 md:gap-4 lg:gap-6';
      case 'lg': return 'gap-4 md:gap-6 lg:gap-8';
      default: return 'gap-3 md:gap-4 lg:gap-6';
    }
  };

  const gridClass = `grid grid-cols-${mobile} sm:grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop} xl:grid-cols-${large}`;

  return (
    <div className={`${gridClass} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = 'md',
  shadow = 'md',
  className = ''
}) => {
  const { isMobile } = useResponsive();

  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return isMobile ? 'p-3' : 'p-4';
      case 'md': return isMobile ? 'p-4' : 'p-6';
      case 'lg': return isMobile ? 'p-5' : 'p-8';
      default: return isMobile ? 'p-4' : 'p-6';
    }
  };

  const getShadowClass = () => {
    switch (shadow) {
      case 'sm': return 'shadow-sm hover:shadow';
      case 'md': return 'shadow hover:shadow-md';
      case 'lg': return 'shadow-md hover:shadow-lg';
      default: return 'shadow hover:shadow-md';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${getShadowClass()} ${getPaddingClass()} transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
};

interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = 'responsive',
  align = 'center',
  justify = 'start',
  gap = 'md',
  wrap = true,
  className = ''
}) => {
  const getDirectionClass = () => {
    switch (direction) {
      case 'row': return 'flex-row';
      case 'col': return 'flex-col';
      case 'responsive': return 'flex-col md:flex-row';
      default: return 'flex-col md:flex-row';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'start': return 'items-start';
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      default: return 'items-center';
    }
  };

  const getJustifyClass = () => {
    switch (justify) {
      case 'start': return 'justify-start';
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      default: return 'justify-start';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2 md:gap-3';
      case 'md': return 'gap-3 md:gap-4';
      case 'lg': return 'gap-4 md:gap-6';
      default: return 'gap-3 md:gap-4';
    }
  };

  return (
    <div className={`flex ${getDirectionClass()} ${getAlignClass()} ${getJustifyClass()} ${getGapClass()} ${wrap ? 'flex-wrap' : ''} ${className}`}>
      {children}
    </div>
  );
}; 