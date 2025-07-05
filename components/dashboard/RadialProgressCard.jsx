import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadialBarChart, PolarAngleAxis, RadialBar } from 'recharts';
import { safeNumber } from '../utils/safeNumbers';

export default function RadialProgressCard({ title, description, value, maxValue, color = '#3b82f6', unit = '' }) {
  const safeValue = safeNumber(value);
  const safeMaxValue = safeNumber(maxValue);
  
  // Garante que o progresso nunca seja mais que 100% ou negativo
  const progress = safeMaxValue > 0 
    ? Math.min(Math.max((safeValue / safeMaxValue) * 100, 0), 100) 
    : 0;
  
  const data = [
    {
      name: 'progress',
      value: progress,
      fill: color,
    },
  ];

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="90%"
              data={data}
              startAngle={90}
              endAngle={-270}
              barSize={20}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: '#e5e7eb' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-900">
              {safeValue.toFixed(1)}{unit}
            </span>
            <span className="text-slate-500">de {safeMaxValue.toFixed(1)}{unit}</span>
          </div>
        </div>
        <p className="text-center text-slate-600 mt-4">{description}</p>
      </CardContent>
    </Card>
  );
}