import React from 'react';

interface Shot {
  runs: number;
  angle: number; // 0-360 degrees
  distance: number; // 0-100 (relative distance)
  type: 'boundary' | 'six' | 'single' | 'double';
}

interface WagonWheelProps {
  shots: Shot[];
  playerName: string;
  title?: string;
}

export const WagonWheel: React.FC<WagonWheelProps> = ({ 
  shots, 
  playerName,
  title 
}) => {
  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  const getShotColor = (shot: Shot) => {
    switch (shot.type) {
      case 'six': return '#8b5cf6'; // Purple
      case 'boundary': return '#10b981'; // Green
      case 'double': return '#3b82f6'; // Blue
      case 'single': return '#f59e0b'; // Orange
      default: return '#6b7280'; // Gray
    }
  };

  const getShotSize = (shot: Shot) => {
    switch (shot.type) {
      case 'six': return 8;
      case 'boundary': return 6;
      case 'double': return 4;
      case 'single': return 3;
      default: return 2;
    }
  };

  const getPosition = (angle: number, distance: number) => {
    const radian = (angle - 90) * (Math.PI / 180); // Adjust so 0° is at top
    const actualRadius = (radius * distance) / 100;
    return {
      x: centerX + actualRadius * Math.cos(radian),
      y: centerY + actualRadius * Math.sin(radian)
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">
        {title || `${playerName} - Shot Chart`}
      </h3>
      
      <div className="flex justify-center">
        <svg width="300" height="300" className="border rounded-full">
          {/* Field circles */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius} 
            fill="none" 
            stroke="#d1d5db" 
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius * 0.6} 
            fill="none" 
            stroke="#d1d5db" 
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius * 0.3} 
            fill="none" 
            stroke="#d1d5db" 
            strokeWidth="1"
          />
          
          {/* Field lines */}
          <line 
            x1={centerX} 
            y1={centerY - radius} 
            x2={centerX} 
            y2={centerY + radius} 
            stroke="#d1d5db" 
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line 
            x1={centerX - radius} 
            y1={centerY} 
            x2={centerX + radius} 
            y2={centerY} 
            stroke="#d1d5db" 
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          
          {/* Batsman position */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r="4" 
            fill="#1f2937"
          />
          
          {/* Shots */}
          {shots.map((shot, index) => {
            const position = getPosition(shot.angle, shot.distance);
            return (
              <circle
                key={index}
                cx={position.x}
                cy={position.y}
                r={getShotSize(shot)}
                fill={getShotColor(shot)}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity cursor-pointer"
              >
                <title>{`${shot.runs} run${shot.runs !== 1 ? 's' : ''} - ${shot.type}`}</title>
              </circle>
            );
          })}
          
          {/* Field labels */}
          <text x={centerX} y={25} textAnchor="middle" className="text-xs fill-gray-500">
            Straight
          </text>
          <text x={centerX} y={285} textAnchor="middle" className="text-xs fill-gray-500">
            Fine Leg
          </text>
          <text x={25} y={centerY + 4} textAnchor="middle" className="text-xs fill-gray-500">
            Leg Side
          </text>
          <text x={275} y={centerY + 4} textAnchor="middle" className="text-xs fill-gray-500">
            Off Side
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <span>Sixes ({shots.filter(s => s.type === 'six').length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Fours ({shots.filter(s => s.type === 'boundary').length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Twos ({shots.filter(s => s.type === 'double').length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
          <span>Singles ({shots.filter(s => s.type === 'single').length})</span>
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-center">
        <div className="text-sm text-gray-600">Total Runs from Shots</div>
        <div className="text-xl font-bold text-blue-600">
          {shots.reduce((sum, shot) => sum + shot.runs, 0)}
        </div>
      </div>
    </div>
  );
}; 