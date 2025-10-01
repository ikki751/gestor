
import React, { useMemo } from 'react';
import type { InventoryData, ColorInfo, CellData } from '../types';
import { BarChart } from './BarChart';

interface DashboardProps {
  inventoryData: InventoryData;
  colors: ColorInfo[];
  onClose: () => void;
}

interface Stats {
  totalValue: number;
  totalStock: number;
  uniqueLenses: number;
  lowStockItems: LowStockItem[];
  materialDistribution: { name: string; value: number }[];
}

interface LowStockItem {
  filters: string;
  sph: string;
  cyl: string;
  stock: number;
  threshold: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ inventoryData, colors, onClose }) => {
  const stats: Stats = useMemo(() => {
    let totalValue = 0;
    let totalStock = 0;
    let uniqueLenses = 0;
    const lowStockItems: LowStockItem[] = [];
    const materialDistribution: Record<string, number> = {};

    const colorMap = new Map(colors.map(c => [c.value, c]));

    Object.entries(inventoryData).forEach(([filterKey, gridData]) => {
      const filters = filterKey.split('|');
      const material = filters[1] || 'Desconocido';

      if (materialDistribution[material] === undefined) {
        materialDistribution[material] = 0;
      }

      Object.entries(gridData).forEach(([sph, cyls]) => {
        Object.entries(cyls).forEach(([cyl, cellData]) => {
          // FIX: Explicitly cast cellData to the correct type, as Object.entries may not infer it correctly.
          const typedCellData = cellData as CellData;
          if (typedCellData && typedCellData.stock > 0 && typedCellData.color) {
            uniqueLenses++;
            totalStock += typedCellData.stock;

            const colorInfoResult = colorMap.get(typedCellData.color);
            if (colorInfoResult) {
              // FIX: Cast colorInfoResult to ColorInfo to resolve type errors when accessing its properties.
              const colorInfo = colorInfoResult as ColorInfo;
              totalValue += typedCellData.stock * colorInfo.price;
              materialDistribution[material] += typedCellData.stock;

              if (colorInfo.lowStockThreshold && typedCellData.stock < colorInfo.lowStockThreshold) {
                lowStockItems.push({
                  filters: filterKey.replace(/\|/g, ' / '),
                  sph,
                  cyl,
                  stock: typedCellData.stock,
                  threshold: colorInfo.lowStockThreshold,
                });
              }
            }
          }
        });
      });
    });

    const materialChartData = Object.entries(materialDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);


    return { totalValue, totalStock, uniqueLenses, lowStockItems, materialDistribution: materialChartData };
  }, [inventoryData, colors]);

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 relative animate-fade-in-down">
       <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        aria-label="Cerrar dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control del Inventario</h2>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Valor Total del Inventario" 
            value={stats.totalValue.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
        />
        <StatCard 
            title="Unidades Totales en Stock" 
            value={stats.totalStock.toLocaleString('es-ES')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard 
            title="Tipos de Lentes Únicos" 
            value={stats.uniqueLenses.toLocaleString('es-ES')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Alertas de Bajo Stock</h3>
            <div className="max-h-80 overflow-y-auto">
                {stats.lowStockItems.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-3">Graduación (ESF/CIL)</th>
                                <th scope="col" className="px-4 py-3 text-center">Stock</th>
                                <th scope="col" className="px-4 py-3 text-center">Límite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.lowStockItems.map((item, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-red-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.sph} / {item.cyl}</td>
                                    <td className="px-4 py-3 text-center"><span className="font-bold text-red-600">{item.stock}</span></td>
                                    <td className="px-4 py-3 text-center">{item.threshold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-10 text-gray-500">¡Todo en orden! No hay productos con bajo stock.</p>
                )}
            </div>
        </div>
        
        {/* Material Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Stock por Material</h3>
            {stats.materialDistribution.length > 0 ? (
                 <BarChart data={stats.materialDistribution} />
            ) : (
                 <p className="text-center py-10 text-gray-500">No hay datos de stock para mostrar.</p>
            )}
        </div>

      </div>
    </div>
  );
};
