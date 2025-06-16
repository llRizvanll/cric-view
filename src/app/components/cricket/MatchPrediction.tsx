import React from 'react';

interface MatchPredictionProps {
  team1Name: string;
  team2Name: string;
  team1WinProbability: number; // 0-100
  team2WinProbability: number; // 0-100
  tieDrawProbability?: number; // 0-100
  currentScore?: {
    runs: number;
    wickets: number;
    overs: number;
    target?: number;
    required?: number;
    requiredRate?: number;
  };
  predictions?: {
    predictedScore?: number;
    powerplayScore?: number;
    deathOversScore?: number;
  };
}

export const MatchPrediction: React.FC<MatchPredictionProps> = ({
  team1Name,
  team2Name,
  team1WinProbability,
  team2WinProbability,
  tieDrawProbability = 0,
  currentScore,
  predictions
}) => {
  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'bg-green-500';
    if (probability >= 50) return 'bg-yellow-500';
    if (probability >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getWinProbabilityText = (probability: number) => {
    if (probability >= 80) return 'Very Likely';
    if (probability >= 60) return 'Likely';
    if (probability >= 40) return 'Possible';
    if (probability >= 20) return 'Unlikely';
    return 'Very Unlikely';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">Match Prediction</h3>
      
      {/* Win Probability Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">{team1Name}</span>
            <span className="text-sm text-gray-600">
              {team1WinProbability.toFixed(1)}% - {getWinProbabilityText(team1WinProbability)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getWinProbabilityColor(team1WinProbability)}`}
              style={{ width: `${team1WinProbability}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">{team2Name}</span>
            <span className="text-sm text-gray-600">
              {team2WinProbability.toFixed(1)}% - {getWinProbabilityText(team2WinProbability)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getWinProbabilityColor(team2WinProbability)}`}
              style={{ width: `${team2WinProbability}%` }}
            ></div>
          </div>
        </div>
        
        {tieDrawProbability > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Tie/Draw</span>
              <span className="text-sm text-gray-600">{tieDrawProbability.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${tieDrawProbability}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Current Match Situation */}
      {currentScore && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Current Situation</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Score</div>
              <div className="text-lg font-bold">
                {currentScore.runs}/{currentScore.wickets} ({currentScore.overs} ov)
              </div>
            </div>
            {currentScore.target && (
              <div>
                <div className="text-blue-600 font-medium">Target</div>
                <div className="text-lg font-bold">{currentScore.target}</div>
              </div>
            )}
            {currentScore.required && (
              <div>
                <div className="text-blue-600 font-medium">Required</div>
                <div className="text-lg font-bold">{currentScore.required} runs</div>
              </div>
            )}
            {currentScore.requiredRate && (
              <div>
                <div className="text-blue-600 font-medium">Required Rate</div>
                <div className="text-lg font-bold">{currentScore.requiredRate.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Score Predictions</h4>
          
          {predictions.predictedScore && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Predicted Final Score</span>
              <span className="font-bold text-green-600">{predictions.predictedScore}</span>
            </div>
          )}
          
          {predictions.powerplayScore && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Powerplay Score (6 overs)</span>
              <span className="font-bold text-blue-600">{predictions.powerplayScore}</span>
            </div>
          )}
          
          {predictions.deathOversScore && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-700">Death Overs Score (16-20)</span>
              <span className="font-bold text-purple-600">{predictions.deathOversScore}</span>
            </div>
          )}
        </div>
      )}

      {/* Key Factors */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">Key Factors</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Pitch conditions favoring batting/bowling</li>
          <li>• Weather and DLS considerations</li>
          <li>• Team momentum and recent form</li>
          <li>• Player matchups and key battles</li>
        </ul>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Predictions based on current match situation, historical data, and statistical models
      </div>
    </div>
  );
}; 