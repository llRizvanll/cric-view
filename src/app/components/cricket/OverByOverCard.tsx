import React from 'react';
import { CricketOver } from '../../models/CricketMatchModel';

interface OverByOverCardProps {
  over: CricketOver;
  overNumber: number;
}

export const OverByOverCard: React.FC<OverByOverCardProps> = ({ over, overNumber }) => {
  const calculateOverStats = () => {
    let runs = 0;
    let wickets = 0;
    let boundaries = 0;
    let sixes = 0;
    let dots = 0;

    over.deliveries.forEach(delivery => {
      runs += delivery.runs.total;
      if (delivery.wickets) wickets += delivery.wickets.length;
      if (delivery.runs.batter === 4) boundaries++;
      if (delivery.runs.batter === 6) sixes++;
      if (delivery.runs.total === 0) dots++;
    });

    return { runs, wickets, boundaries, sixes, dots };
  };

  const stats = calculateOverStats();
  const deliveryCount = over.deliveries.length;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Over {overNumber}</h4>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stats.runs}</div>
          <div className="text-xs text-gray-500">{deliveryCount} balls</div>
        </div>
      </div>

      {/* Ball by ball display - Fixed grid layout */}
      <div className="mb-4">
        <div className="grid grid-cols-6 gap-2 justify-items-center">
          {over.deliveries.map((delivery, index) => {
            const runs = delivery.runs.total;
            const isWicket = delivery.wickets && delivery.wickets.length > 0;
            const isBoundary = delivery.runs.batter === 4 || delivery.runs.batter === 6;
            
            let ballClass = "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 ";
            
            if (isWicket) {
              ballClass += "bg-red-500 text-white shadow-md";
            } else if (isBoundary) {
              ballClass += delivery.runs.batter === 6 ? "bg-purple-500 text-white shadow-md" : "bg-green-500 text-white shadow-md";
            } else if (runs === 0) {
              ballClass += "bg-gray-300 text-gray-700";
            } else {
              ballClass += "bg-blue-100 text-blue-700 border border-blue-200";
            }

            return (
              <div key={index} className={ballClass} title={`Ball ${index + 1}: ${runs} runs`}>
                {isWicket ? 'W' : runs}
              </div>
            );
          })}
          {/* Fill empty slots if less than 6 balls */}
          {Array.from({ length: 6 - over.deliveries.length }, (_, index) => (
            <div key={`empty-${index}`} className="w-9 h-9 rounded-full border-2 border-dashed border-gray-200 opacity-30"></div>
          ))}
        </div>
      </div>

      {/* Over summary - Better aligned grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center bg-green-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-green-600">{stats.boundaries}</div>
          <div className="text-xs text-green-700 font-medium">Fours</div>
        </div>
        <div className="text-center bg-purple-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-purple-600">{stats.sixes}</div>
          <div className="text-xs text-purple-700 font-medium">Sixes</div>
        </div>
        <div className="text-center bg-red-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-red-600">{stats.wickets}</div>
          <div className="text-xs text-red-700 font-medium">Wickets</div>
        </div>
        <div className="text-center bg-gray-50 rounded-lg py-2 px-1">
          <div className="text-lg font-bold text-gray-600">{stats.dots}</div>
          <div className="text-xs text-gray-700 font-medium">Dots</div>
        </div>
      </div>

      {/* Key events - Fixed height section */}
      <div className="mt-auto">
        {(stats.wickets > 0 || stats.sixes > 0 || stats.runs >= 15) ? (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="space-y-1">
              {stats.wickets > 0 && (
                <div className="flex items-center text-red-600 text-xs font-medium">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {stats.wickets} wicket{stats.wickets > 1 ? 's' : ''} fell
                </div>
              )}
              {stats.sixes > 0 && (
                <div className="flex items-center text-purple-600 text-xs font-medium">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  {stats.sixes} six{stats.sixes > 1 ? 'es' : ''} hit
                </div>
              )}
              {stats.runs >= 15 && (
                <div className="flex items-center text-green-600 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  High scoring over!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-12 flex items-center justify-center text-gray-400 text-xs">
            Regular over
          </div>
        )}
      </div>
    </div>
  );
}; 