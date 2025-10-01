import React from 'react';

interface BarChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#3b82f6', '#84cc16', '#f97316', '#8b5cf6', '#ec4899'];

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <div className="text-center py-10 text-gray-500">No hay datos suficientes para el gráfico.</div>;
  }

  return (
    <div className="space-y-4 pt-2">
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const color = COLORS[index % COLORS.length];

        return (
          <div key={item.name} className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
              <span className="text-sm font-semibold text-gray-800">{item.value.toLocaleString('es-ES')} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
