'use client';

import React from 'react';
import { CricketInnings } from '../../models/CricketMatchModel';

interface InningsSelectorProps {
  innings: CricketInnings[];
  selectedInnings: number;
  onInningsChange: (index: number) => void;
  title?: string;
}

export const InningsSelector: React.FC<InningsSelectorProps> = ({ 
  innings, 
  selectedInnings, 
  onInningsChange,
  title = "Select Innings"
}) => {
  if (!innings || innings.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex space-x-2">
        {innings.map((inning, index) => (
          <button
            key={index}
            onClick={() => onInningsChange(index)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedInnings === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {inning.team} ({index === 0 ? '1st' : '2nd'} Innings)
          </button>
        ))}
      </div>
    </div>
  );
}; 