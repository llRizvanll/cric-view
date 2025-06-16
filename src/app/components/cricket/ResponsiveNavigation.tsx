'use client';

import React, { useState } from 'react';
import { useResponsive, getResponsiveText } from '../../utils/responsive';

interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  className?: string;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  activeItem,
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 bg-gray-800 text-white rounded-lg">
          <h2 className={`${getResponsiveText('text-lg', 'md:text-xl')} font-semibold`}>
            Cricket Analytics
          </h2>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                  activeItem === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Tablet and Desktop horizontal navigation
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="flex overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-shrink-0 px-4 md:px-6 py-3 md:py-4 ${getResponsiveText('text-sm', 'md:text-base')} font-medium transition-colors flex items-center gap-2 md:gap-3 ${
              activeItem === item.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.icon && <span className={`${isTablet ? 'text-lg' : 'text-xl'}`}>{item.icon}</span>}
            <span className={isTablet ? 'hidden lg:inline' : ''}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 