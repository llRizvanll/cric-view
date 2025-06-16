import React from 'react';
import { CricketInnings } from '../../models/CricketMatchModel';

interface CommentaryItem {
  over: number;
  ball: number;
  runs: number;
  text: string;
  isWicket: boolean;
  isBoundary: boolean;
}

interface LiveCommentaryProps {
  innings: CricketInnings;
  title?: string;
  maxItems?: number;
}

export const LiveCommentary: React.FC<LiveCommentaryProps> = ({ 
  innings, 
  title = "Live Commentary",
  maxItems = 10
}) => {
  const generateCommentary = (innings: CricketInnings): CommentaryItem[] => {
    const commentary: CommentaryItem[] = [];
    
    innings.overs.forEach((over, overIndex) => {
      over.deliveries.forEach((delivery, ballIndex) => {
        const runs = delivery.runs.total;
        const isWicket = delivery.wickets && delivery.wickets.length > 0;
        const isBoundary = delivery.runs.batter === 4 || delivery.runs.batter === 6;
        
        let text = `${delivery.batter} faces ${delivery.bowler}`;
        
        if (isWicket) {
          text += `, WICKET! ${delivery.wickets![0].player_out} ${delivery.wickets![0].kind}`;
        } else if (isBoundary) {
          text += `, ${delivery.runs.batter === 6 ? 'SIX!' : 'FOUR!'} Great shot!`;
        } else if (runs > 0) {
          text += `, ${runs} run${runs > 1 ? 's' : ''}`;
        } else {
          text += `, dot ball`;
        }
        
        commentary.push({
          over: overIndex + 1,
          ball: ballIndex + 1,
          runs,
          text,
          isWicket,
          isBoundary
        });
      });
    });
    
    return commentary.slice(-maxItems).reverse();
  };

  const commentary = generateCommentary(innings);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <span className="mr-2">🎙️</span>
        {title}
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {commentary.map((item, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border-l-4 ${
              item.isWicket 
                ? 'bg-red-50 border-red-500' 
                : item.isBoundary 
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-blue-600">
                {item.over}.{item.ball}
              </span>
              <span className={`text-sm font-bold ${
                item.isWicket ? 'text-red-600' : 
                item.isBoundary ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {item.runs} run{item.runs !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-gray-700">{item.text}</p>
          </div>
        ))}
      </div>
      
      {commentary.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No commentary available
        </div>
      )}
    </div>
  );
}; 