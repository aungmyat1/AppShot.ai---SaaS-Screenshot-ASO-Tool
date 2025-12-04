import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { name: string; score: number }[];
  isDarkMode: boolean;
}

const AnalysisChart: React.FC<Props> = ({ data, isDarkMode }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDarkMode ? "#334155" : "#e2e8f0"} 
          />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} 
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}}
            contentStyle={{
                borderRadius: '8px', 
                border: isDarkMode ? '1px solid #334155' : 'none', 
                backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.name === data[0].name ? '#3b82f6' : (isDarkMode ? '#475569' : '#94a3b8')} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisChart;