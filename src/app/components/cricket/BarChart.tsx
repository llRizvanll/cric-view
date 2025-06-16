import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, string | number>>;
  xAxisKey: string;
  yAxisKey: string;
  title: string;
  color?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  title,
  color = '#82ca9d',
  height = 300,
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill={color} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 