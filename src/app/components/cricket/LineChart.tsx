import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  title: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  title,
  color = '#8884d8',
  height = 300,
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsLineChart
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
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              activeDot={{ r: 8 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 