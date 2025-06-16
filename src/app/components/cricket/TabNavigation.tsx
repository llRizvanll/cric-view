'use client';

import React from 'react';

export type TabType = 'overview' | 'players' | 'batting' | 'bowling' | 'overs' | 'commentary';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'players', label: 'Players', icon: '👥' },
    { id: 'batting', label: 'Batting', icon: '🏏' },
    { id: 'bowling', label: 'Bowling', icon: '⚾' },
    { id: 'overs', label: 'Overs', icon: '📈' },
    { id: 'commentary', label: 'Commentary', icon: '🎙️' }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-0.5 border border-gray-200">
      <div className="flex flex-wrap gap-0.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 