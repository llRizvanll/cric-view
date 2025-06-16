import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title: string;
  colors?: string[];
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colors = COLORS,
  height = 300,
}) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => 
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 