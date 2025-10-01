

import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected relative import paths.
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ColorPalette } from './components/ColorPalette';
import { InventoryGrid } from './components/InventoryGrid';
import { HowToUse } from './components/HowToUse';
import { Dashboard } from './components/Dashboard';
import type { LensFilters, InventoryData, GridData, ActiveCell, CellData, ColorInfo, CylinderData } from './types';
import { INITIAL_FILTER_OPTIONS, getInitialInventoryData, SPHERE_VALUES, CYLINDER_VALUES, INITIAL_COLORS } from './constants';

const App: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<InventoryData>(() => {
    try {
      const savedData = localStorage.getItem('opticalLensInventory');
      return savedData ? JSON.parse(savedData) : getInitialInventoryData();
    } catch (error) {
      console.error("Error loading data from localStorage", error);
      return getInitialInventoryData();
    }
  });

  const [colors, setColors] = useState<ColorInfo[]>(() => {
    try {
      const savedColors = localStorage.getItem('opticalLensColors');
      // FIX: Add a simple migration/check to ensure price exists on older saved data
      const parsed = savedColors ? JSON.parse(savedColors) : INITIAL_COLORS;
      return parsed.map((c: ColorInfo) => ({...c, price: c.price ?? 0}));
    } catch (error) {
      console.error("Error loading colors from localStorage", error);
      return INITIAL_COLORS;
    }
  });

  const [filterOptions, setFilterOptions] = useState<Record<keyof LensFilters, string[]>>(() => {
    try {
      const savedOptions = localStorage.getItem('opticalLensFilterOptions');
      return savedOptions ? JSON.parse(savedOptions) : INITIAL_FILTER_OPTIONS;
    } catch (error) {
        console.error("Error loading filter options from localStorage", error);
        return INITIAL_FILTER_OPTIONS;
    }
  });

  const [filters, setFilters] = useState<LensFilters>({
    foco: 'Monofocal',
    material: 'Mineral',
    color: 'Sin color',
    fotocromatico: 'Sin Fotocromático',
    tratamiento: 'Antirreflejos',
    diametro: '65',
    adicion: '0',
    indiceRefraccion: '1.523',
  });
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'sphere' | 'stock'; column?: string; direction: 'asc' | 'desc' }>({ key: 'sphere', direction: 'desc' });

  useEffect(() => {
    try {
      localStorage.setItem('opticalLensInventory', JSON.stringify(inventoryData));
    } catch (error) {
      console.error("Error saving data to localStorage", error);
    }
  }, [inventoryData]);
  
  useEffect(() => {
    try {
      localStorage.setItem('opticalLensColors', JSON.stringify(colors));
    } catch (error) {
      console.error("Error saving colors to localStorage", error);
    }
  }, [colors]);

  useEffect(() => {
    try {
        localStorage.setItem('opticalLensFilterOptions', JSON.stringify(filterOptions));
    } catch (error) {
        console.error("Error saving filter options to localStorage", error);
    }
  }, [filterOptions]);

  const currentGridKey = useMemo(() => {
    return Object.values(filters).join('|');
  }, [filters]);

  const currentGridData: GridData = useMemo(() => {
    return inventoryData[currentGridKey] || {};
  }, [inventoryData, currentGridKey]);

  const { filteredSphereValues, filteredCylinderValues } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { filteredSphereValues: SPHERE_VALUES, filteredCylinderValues: CYLINDER_VALUES };
    }
    const parts = query.split(/\s+/);
    const sphereQuery = parts[0];
    const cylinderQuery = parts.length > 1 ? parts[1] : null;

    const filteredSpheres = SPHERE_VALUES.filter(sph => sph.toLowerCase().startsWith(sphereQuery));
    const filteredCylinders = cylinderQuery
      ? CYLINDER_VALUES.filter(cyl => cyl.toLowerCase().startsWith(cylinderQuery))
      : CYLINDER_VALUES;

    return { filteredSphereValues: filteredSpheres, filteredCylinderValues: filteredCylinders };
  }, [searchQuery]);

  const { sortedSphereValues, sortedCylinderValues } = useMemo(() => {
    const newSortedSphereValues = [...filteredSphereValues];
    // Cylinder values are not sorted by user interaction to provide a stable column layout.
    const newSortedCylinderValues = [...filteredCylinderValues];

    const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;

    if (sortConfig.key === 'sphere') {
      newSortedSphereValues.sort((a, b) => (parseFloat(a) - parseFloat(b)) * directionMultiplier);
    } else if (sortConfig.key === 'stock' && sortConfig.column) {
      const cyl = sortConfig.column;
      newSortedSphereValues.sort((sphA, sphB) => {
        // Use -Infinity to ensure items without stock are sorted to the end in descending order.
        const stockA = currentGridData?.[sphA]?.[cyl]?.stock ?? -Infinity;
        const stockB = currentGridData?.[sphB]?.[cyl]?.stock ?? -Infinity;
        
        if (stockA !== stockB) {
          return (stockA - stockB) * directionMultiplier;
        }

        // Secondary sort by sphere value to maintain stability
        return parseFloat(sphB) - parseFloat(sphA);
      });
    }

    return { sortedSphereValues: newSortedSphereValues, sortedCylinderValues: newSortedCylinderValues };
  }, [filteredSphereValues, filteredCylinderValues, sortConfig, currentGridData]);


  const handleFilterChange = (filterName: keyof LensFilters, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
    setActiveCell(null);
  };

  const handleAddFilterOption = (filterName: keyof LensFilters, newOption: string) => {
    setFilterOptions(prevOptions => {
        const currentOptions = prevOptions[filterName] || [];
        if (currentOptions.includes(newOption)) return prevOptions; // Avoid duplicates
        return {
            ...prevOptions,
            [filterName]: [...currentOptions, newOption]
        };
    });
    // Automatically select the new option
    handleFilterChange(filterName, newOption);
  };

  const handleColorSelect = (colorValue: string | null) => {
    setSelectedColor(colorValue);
    setActiveCell(null);
  };
  
  const handleColorPriceChange = (colorValue: string, newPrice: number) => {
    setColors(prevColors =>
      prevColors.map(c =>
        c.value === colorValue ? { ...c, price: newPrice } : c
      )
    );
  };
  
  const handleAddColor = (newColorData: Omit<ColorInfo, 'textColor'>) => {
    const getTextColor = (hex: string): string => {
        if (!hex || hex.length < 7) return 'text-gray-900'; // Default for safety
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // http://www.w3.org/TR/AERT#color-contrast
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? 'text-gray-900' : 'text-white';
    };

    const newCompleteColor: ColorInfo = {
        ...newColorData,
        // Ensure lowStockThreshold is undefined if it's 0 or not provided, to avoid faulty alerts
        lowStockThreshold: newColorData.lowStockThreshold && newColorData.lowStockThreshold > 0 ? newColorData.lowStockThreshold : undefined,
        textColor: getTextColor(newColorData.value),
    };

    setColors(prevColors => [...prevColors, newCompleteColor]);
  };

  const handleCellClick = (sph: string, cyl: string) => {
    if (selectedColor !== null) {
      // Painting mode
      setInventoryData(prevData => {
        const prevGrid = prevData[currentGridKey];
        const prevSphere = prevGrid?.[sph];
        const prevCell = prevSphere?.[cyl] || { stock: 0, color: '' };

        // Optimization: Do nothing if the color is already applied
        if (prevCell.color === selectedColor) {
          return prevData;
        }

        const newCell: CellData = {
          ...prevCell,
          color: selectedColor,
          // Reset stock to 0 if the cell is being erased
          stock: selectedColor === '' ? 0 : prevCell.stock,
        };

        return {
          ...prevData,
          [currentGridKey]: {
            ...(prevGrid ?? {}),
            [sph]: {
              ...(prevSphere ?? {}),
              [cyl]: newCell,
            },
          },
        };
      });
    } else {
      // Editing mode
      // FIX: Replaced problematic optional chaining with explicit safe access to resolve 'unknown' type errors on lines 291 and 293.
      const sphereData = currentGridData[sph];
      const cell = sphereData ? sphereData[cyl] : undefined;
      if (cell && cell.color) {
        setActiveCell({ sph, cyl });
      } else {
        setActiveCell(null);
      }
    }
  };

  const handleStockChange = (sph: string, cyl: string, newStock: number) => {
    setInventoryData(prevData => {
      // FIX: Replaced problematic optional chaining with explicit safe access to resolve 'unknown' type error on line 301.
      const currentGrid = prevData[currentGridKey];
      const currentSphere = currentGrid ? currentGrid[sph] : undefined;
      const currentCell = (currentSphere && currentSphere[cyl]) || { stock: 0, color: '' };
  
      return {
        ...prevData,
        [currentGridKey]: {
          ...(currentGrid ?? {}),
          [sph]: {
            ...(currentSphere ?? {}),
            [cyl]: {
              ...currentCell,
              stock: newStock,
            },
          },
        },
      };
    });
  };

  const handleSort = (key: 'sphere' | 'stock', column?: string) => {
    setSortConfig(prevConfig => {
      const isSameSort = prevConfig.key === key && prevConfig.column === column;
      if (isSameSort) {
        // Toggle direction if the same header is clicked again
        return { ...prevConfig, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Set new sort key, defaulting to descending for stock and ascending for sphere
      return { key, column, direction: key === 'stock' ? 'desc' : 'asc' };
    });
  };

  const handleExportCSV = () => {
    const headers = [
        'ID', 'SKU', 'Foco', 'Material', 'Color', 'Fotocromatico', 'Tratamiento', 
        'Diametro', 'Adicion', 'Indice Refraccion', 'Esfera', 'Cilindro', 'Stock', 'Precio'
    ];

    const rows: (string|number)[][] = [];
    let idCounter = 1;

    Object.entries(inventoryData).forEach(([filterKey, gridData]) => {
        const filterValues = filterKey.split('|');

        Object.entries(gridData).forEach(([sph, cyls]) => {
            Object.entries(cyls).forEach(([cyl, cellData]) => {
                if (cellData && cellData.color) { // Export only existing lenses
                    const sku = `${filterKey}-${sph}-${cyl}`;
                    const colorInfo = colors.find(c => c.value === cellData.color);
                    const price = colorInfo ? colorInfo.price : 0;
                    const rowData = [
                        idCounter++,
                        sku,
                        ...filterValues,
                        sph,
                        cyl,
                        cellData.stock,
                        price.toFixed(2)
                    ];
                    rows.push(rowData);
                }
            });
        });
    });

    if (rows.length === 0) {
        alert("No hay datos de inventario para exportar.");
        return;
    }

    const csvContent = [
        headers.join(','),
        ...rows.map(row => 
            row.map(cell => {
                const cellStr = String(cell);
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventario_lentes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            try {
                const lines = csv.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("El archivo CSV está vacío o no tiene datos.");
                
                const headers = lines[0].trim().split(',').map(h => h.replace(/"/g, ''));
                const expectedHeaders = ['Foco', 'Material', 'Color', 'Fotocromatico', 'Tratamiento', 'Diametro', 'Adicion', 'Indice Refraccion', 'Esfera', 'Cilindro', 'Stock'];
                const headerIndices: Record<string, number> = {};

                expectedHeaders.forEach(eh => {
                    const index = headers.findIndex(h => h.trim() === eh);
                    if (index === -1) throw new Error(`Falta la columna requerida en el CSV: ${eh}`);
                    headerIndices[eh] = index;
                });

                let updatedCount = 0;
                setInventoryData(prevData => {
                    const newData: InventoryData = JSON.parse(JSON.stringify(prevData)); // Deep copy

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].trim().split(',');
                        if (values.length < expectedHeaders.length) continue;

                        const filterValues = [
                            values[headerIndices['Foco']],
                            values[headerIndices['Material']],
                            values[headerIndices['Color']],
                            values[headerIndices['Fotocromatico']],
                            values[headerIndices['Tratamiento']],
                            values[headerIndices['Diametro']],
                            values[headerIndices['Adicion']],
                            values[headerIndices['Indice Refraccion']],
                        ];
                        const key = filterValues.join('|');
                        const sph = values[headerIndices['Esfera']];
                        const cyl = values[headerIndices['Cilindro']];
                        const stock = parseInt(values[headerIndices['Stock']], 10);

                        if (key && sph && cyl && !isNaN(stock)) {
                            if (!newData[key]) newData[key] = {};
                            // FIX: By casting `newData[key]` to GridData, we can safely access and modify its properties.
                            const grid = newData[key] as GridData;
                            if (!grid[sph]) grid[sph] = {};
                            const sphere = grid[sph] as CylinderData;

                            const existingCell = sphere[cyl];
                            const currentColor = existingCell?.color;
                            // Assign a default color if item is new or has no color but has stock
                            const defaultColor = colors.find(c => c.name === 'Stock Bajo');
                            const newColor = currentColor || (stock > 0 && defaultColor ? defaultColor.value : '');

                            sphere[cyl] = { stock, color: newColor };
                            updatedCount++;
                        }
                    }
                    return newData;
                });
                alert(`Importación completada. Se procesaron ${updatedCount} registros.`);
            } catch (error) {
                console.error("Error al importar CSV:", error);
                alert(`Error al procesar el archivo CSV: ${error instanceof Error ? error.message : String(error)}`);
            }
        };

        reader.readAsText(file);
    };

    input.click();
  };

  const mainContentVisible = !showDashboard;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header 
        onToggleHelp={() => setShowHelp(!showHelp)} 
        onExportCSV={handleExportCSV} 
        onImportCSV={handleImportCSV}
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {showHelp && <HowToUse onClose={() => setShowHelp(false)} />}
        {showDashboard && <Dashboard inventoryData={inventoryData} colors={colors} onClose={() => setShowDashboard(false)} />}
        
        {mainContentVisible && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por Esfera / Cilindro (Ej: 5.00 0.75)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración de Lente</h2>
              <FilterBar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onAddOption={handleAddFilterOption}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ColorPalette
                colors={colors}
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
                onPriceChange={handleColorPriceChange}
                onAddColor={handleAddColor}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Grilla de Stock
                </h2>
              <InventoryGrid
                gridData={currentGridData}
                sphereValues={sortedSphereValues}
                cylinderValues={sortedCylinderValues}
                colors={colors}
                onCellClick={handleCellClick}
                activeCell={activeCell}
                onStockChange={handleStockChange}
                onSetActiveCell={setActiveCell}
                isPainting={isPainting}
                setIsPainting={setIsPainting}
                selectedColor={selectedColor}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;