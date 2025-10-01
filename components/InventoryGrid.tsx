
import React, { useState, useEffect, useRef } from 'react';
import type { GridData, ActiveCell, ColorInfo } from '../types';

interface InventoryGridProps {
  gridData: GridData;
  sphereValues: string[];
  cylinderValues: string[];
  colors: ColorInfo[];
  onCellClick: (sph: string, cyl: string) => void;
  activeCell: ActiveCell | null;
  onStockChange: (sph: string, cyl: string, newStock: number) => void;
  onSetActiveCell: (cell: ActiveCell | null) => void;
  isPainting: boolean;
  setIsPainting: (isPainting: boolean) => void;
  selectedColor: string | null;
  sortConfig: { key: 'sphere' | 'stock'; column?: string; direction: 'asc' | 'desc' };
  onSort: (key: 'sphere' | 'stock', column?: string) => void;
}

const StockInput: React.FC<{
    sph: string;
    cyl: string;
    initialStock: number;
    onStockChange: (sph: string, cyl: string, newStock: number) => void;
    onBlur: () => void;
}> = ({ sph, cyl, initialStock, onStockChange, onBlur }) => {
    const [stock, setStock] = useState(initialStock.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStock(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            onBlur();
        }
    };
    
    const handleSubmit = () => {
        const newStock = parseInt(stock, 10);
        if (!isNaN(newStock) && newStock >= 0) {
            onStockChange(sph, cyl, newStock);
        }
        onBlur();
    };

    return (
        <input
            ref={inputRef}
            type="number"
            value={stock}
            onChange={handleChange}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="w-16 text-center bg-white border border-blue-500 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            min="0"
        />
    );
};

const SortIcon = ({ direction }: { direction: 'asc' | 'desc' }) => {
    return direction === 'asc' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
    );
};


export const InventoryGrid: React.FC<InventoryGridProps> = ({
  gridData,
  sphereValues,
  cylinderValues,
  colors,
  onCellClick,
  activeCell,
  onStockChange,
  onSetActiveCell,
  isPainting,
  setIsPainting,
  selectedColor,
  sortConfig,
  onSort,
}) => {

  if (sphereValues.length === 0 || cylinderValues.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No se encontraron resultados para la búsqueda.</p>
        <p className="text-sm">Intente con otra Esfera o Cilindro.</p>
      </div>
    );
  }

  const handleCellMouseEnter = (sph: string, cyl: string) => {
    if (isPainting) {
      onCellClick(sph, cyl);
    }
  };

  return (
    <div className={`overflow-x-auto relative ${isPainting ? 'user-select-none' : ''}`}>
      <table 
        className="min-w-full border-collapse border border-gray-200"
        onMouseDown={() => {
          if (selectedColor !== null) {
            setIsPainting(true);
          }
        }}
        onMouseUp={() => {
            if (isPainting) {
                setIsPainting(false);
            }
        }}
        onMouseLeave={() => {
            if (isPainting) {
                setIsPainting(false);
            }
        }}
      >
        <thead>
          <tr className="bg-gray-100">
            <th 
                className="sticky left-0 bg-gray-100 z-10 p-2 border border-gray-300 font-semibold text-gray-600 text-sm cursor-pointer select-none hover:bg-gray-200 transition-colors"
                onClick={() => onSort('sphere')}
            >
                ESF / CIL
                {sortConfig?.key === 'sphere' && <SortIcon direction={sortConfig.direction} />}
            </th>
            {cylinderValues.map(cyl => (
              <th 
                key={cyl} 
                className="p-2 border border-gray-300 font-semibold text-gray-600 text-sm cursor-pointer select-none hover:bg-gray-200 transition-colors"
                onClick={() => onSort('stock', cyl)}
              >
                {cyl}
                {sortConfig?.key === 'stock' && sortConfig.column === cyl && <SortIcon direction={sortConfig.direction} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sphereValues.map(sph => (
            <tr key={sph} className="hover:bg-gray-50">
              <th className="sticky left-0 bg-gray-100 z-10 p-2 border border-gray-300 font-semibold text-gray-600 text-sm">{sph}</th>
              {cylinderValues.map(cyl => {
                const cellData = gridData?.[sph]?.[cyl];
                const isActive = activeCell?.sph === sph && activeCell?.cyl === cyl;
                
                const colorInfo = colors.find(c => c.value === cellData?.color);
                const textColorClass = colorInfo?.textColor || 'text-gray-800';
                const price = colorInfo ? colorInfo.price : 0;
                const tooltip = cellData?.color 
                    ? `Stock: ${cellData.stock}\nPrecio: $${price.toFixed(2)}`
                    : 'No disponible';

                const cellEventHandlers = selectedColor !== null
                    ? { onMouseDown: () => onCellClick(sph, cyl) } // Paint mode uses mousedown for dragging
                    : { onClick: () => onCellClick(sph, cyl) };      // Edit mode uses click to avoid event conflicts

                return (
                  <td
                    key={cyl}
                    {...cellEventHandlers}
                    onMouseEnter={() => handleCellMouseEnter(sph, cyl)}
                    className={`p-0 border text-center text-sm cursor-pointer h-12 font-semibold ${textColorClass} ${isActive ? 'border-blue-500 animate-pulse-border' : 'border-gray-200'}`}
                    style={{ backgroundColor: cellData?.color || 'transparent' }}
                    title={tooltip}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                    {isActive ? (
                        <StockInput
                            sph={sph}
                            cyl={cyl}
                            initialStock={cellData?.stock || 0}
                            onStockChange={onStockChange}
                            onBlur={() => onSetActiveCell(null)}
                        />
                    ) : (
                      cellData?.stock > 0 ? cellData.stock : ''
                    )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Simple utility to add a style tag for custom animations and properties
const style = document.createElement('style');
style.innerHTML = `
.user-select-none {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}
@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
  }
  100% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}
.animate-pulse-border {
  position: relative; /* Required for z-index and shadow */
  z-index: 10;
  animation: pulse-border 1.5s infinite;
}
`;
document.head.appendChild(style);