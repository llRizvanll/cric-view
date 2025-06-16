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
  
  // Determine over type for styling
  const getOverType = () => {
    if (stats.wickets >= 2) return 'wicket';
    if (stats.runs >= 20) return 'expensive';
    if (stats.runs >= 15) return 'good-batting';
    if (stats.runs === 0) return 'maiden';
    if (stats.runs <= 3) return 'economical';
    return 'normal';
  };

  const overType = getOverType();

  const getOverTypeInfo = () => {
    switch (overType) {
      case 'wicket': return { color: 'border-red-500/50', bgColor: 'bg-red-500/10', icon: '🔥', label: 'Wickets' };
      case 'expensive': return { color: 'border-orange-500/50', bgColor: 'bg-orange-500/10', icon: '💥', label: 'Expensive' };
      case 'good-batting': return { color: 'border-purple-500/50', bgColor: 'bg-purple-500/10', icon: '⚡', label: 'Good Batting' };
      case 'maiden': return { color: 'border-green-500/50', bgColor: 'bg-green-500/10', icon: '🎯', label: 'Maiden' };
      case 'economical': return { color: 'border-blue-500/50', bgColor: 'bg-blue-500/10', icon: '🛡️', label: 'Economical' };
      default: return { color: 'border-gray-600/50', bgColor: 'bg-gray-700/30', icon: '🏏', label: 'Regular' };
    }
  };

  const typeInfo = getOverTypeInfo();

  return (
    <div className={`${typeInfo.bgColor} border ${typeInfo.color} rounded-xl p-3 hover:scale-[1.02] transition-all duration-200 h-full flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-600/50 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">{overNumber}</span>
          </div>
          <div>
            <h4 className="text-white font-semibold text-xs">Over {overNumber}</h4>
            <div className="flex items-center gap-1">
              <span className="text-xs">{typeInfo.icon}</span>
              <span className="text-gray-400 text-xs">{typeInfo.label}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{stats.runs}</div>
          <div className="text-gray-400 text-xs">{deliveryCount} balls</div>
        </div>
      </div>

      {/* Ball by ball display */}
      <div className="mb-3">
        <div className="text-gray-400 text-xs mb-1.5 text-center">Ball by Ball</div>
        <div className="grid grid-cols-6 gap-1.5 justify-items-center">
          {over.deliveries.map((delivery, index) => {
            const runs = delivery.runs.total;
            const isWicket = delivery.wickets && delivery.wickets.length > 0;
            
            let ballClass = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 ";
            let ballContent = isWicket ? 'W' : runs.toString();
            
            if (isWicket) {
              ballClass += "bg-red-500 text-white border border-red-400";
            } else if (delivery.runs.batter === 6) {
              ballClass += "bg-purple-500 text-white border border-purple-400";
            } else if (delivery.runs.batter === 4) {
              ballClass += "bg-green-500 text-white border border-green-400";
            } else if (runs === 0) {
              ballClass += "bg-gray-500 text-white border border-gray-400";
            } else {
              ballClass += "bg-blue-500 text-white border border-blue-400";
            }

            return (
              <div 
                key={index} 
                className={ballClass} 
                title={`Ball ${index + 1}: ${runs} runs${isWicket ? ' - Wicket!' : ''}`}
              >
                {ballContent}
              </div>
            );
          })}
          {/* Fill empty slots */}
          {Array.from({ length: 6 - over.deliveries.length }, (_, index) => (
            <div 
              key={`empty-${index}`} 
              className="w-6 h-6 rounded-full border border-dashed border-gray-500/30 opacity-40"
            ></div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <div className="text-center bg-gray-600/20 rounded-md p-1.5">
          <div className="text-sm font-bold text-green-300">{stats.boundaries}</div>
          <div className="text-gray-400 text-xs">4s</div>
        </div>
        <div className="text-center bg-gray-600/20 rounded-md p-1.5">
          <div className="text-sm font-bold text-purple-300">{stats.sixes}</div>
          <div className="text-gray-400 text-xs">6s</div>
        </div>
        <div className="text-center bg-gray-600/20 rounded-md p-1.5">
          <div className="text-sm font-bold text-red-300">{stats.wickets}</div>
          <div className="text-gray-400 text-xs">Wkts</div>
        </div>
        <div className="text-center bg-gray-600/20 rounded-md p-1.5">
          <div className="text-sm font-bold text-gray-300">{stats.dots}</div>
          <div className="text-gray-400 text-xs">Dots</div>
        </div>
      </div>

      {/* Key events */}
      <div className="mt-auto">
        {(stats.wickets > 0 || stats.sixes > 0 || stats.runs >= 15 || stats.runs === 0) ? (
          <div className="bg-gray-600/20 rounded-md p-2">
            <div className="space-y-0.5">
              {stats.runs === 0 && (
                <div className="flex items-center gap-1.5 text-green-300 text-xs">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>Maiden Over! 🎯</span>
                </div>
              )}
              {stats.wickets > 0 && (
                <div className="flex items-center gap-1.5 text-red-300 text-xs">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  <span>{stats.wickets} wicket{stats.wickets > 1 ? 's' : ''} fell 🔥</span>
                </div>
              )}
              {stats.sixes > 0 && (
                <div className="flex items-center gap-1.5 text-purple-300 text-xs">
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <span>{stats.sixes} six{stats.sixes > 1 ? 'es' : ''} hit 🚀</span>
                </div>
              )}
              {stats.runs >= 20 && (
                <div className="flex items-center gap-1.5 text-orange-300 text-xs">
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span>Expensive over! 💥</span>
                </div>
              )}
              {stats.runs >= 15 && stats.runs < 20 && (
                <div className="flex items-center gap-1.5 text-yellow-300 text-xs">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                  <span>Great batting! ⚡</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-8 flex items-center justify-center bg-gray-600/10 rounded-md">
            <span className="text-gray-500 text-xs">🏏 Standard over</span>
          </div>
        )}
      </div>
    </div>
  );
}; 