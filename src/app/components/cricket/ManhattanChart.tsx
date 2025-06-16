import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ManhattanChartProps {
  data: Array<{
    over: number;
    runs: number;
    wickets: number;
  }>;
  title?: string;
  height?: number;
}

export const ManhattanChart: React.FC<ManhattanChartProps> = ({
  data,
  title = "Runs Per Over",
  height = 300,
}) => {
  const getBarColor = (runs: number, wickets: number) => {
    if (wickets > 0) return '#ef4444'; // Red for wickets
    if (runs >= 15) return '#22c55e'; // Green for high scoring
    if (runs >= 10) return '#3b82f6'; // Blue for good scoring
    if (runs >= 6) return '#f59e0b';  // Orange for average
    return '#6b7280'; // Gray for low scoring
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`Over ${label}`}</p>
          <p className="text-blue-600">{`Runs: ${data.runs}`}</p>
          {data.wickets > 0 && (
            <p className="text-red-600">{`Wickets: ${data.wickets}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="over" 
              label={{ value: 'Overs', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              label={{ value: 'Runs', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.runs, entry.wickets)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Wicket Over</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>15+ Runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>10-14 Runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>6-9 Runs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>0-5 Runs</span>
        </div>
      </div>
    </div>
  );
}; 