import React, { useState } from 'react';
import type { ColorInfo } from '../types';

interface ColorPaletteProps {
  colors: ColorInfo[];
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  onPriceChange: (colorValue: string, newPrice: number) => void;
  onAddColor: (newColor: Omit<ColorInfo, 'textColor'>) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, selectedColor, onColorSelect, onPriceChange, onAddColor }) => {
  const eraserColor = colors.find(c => c.value === '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState({
      name: '',
      value: '#FBBF24', // amber-400
      price: 0,
      lowStockThreshold: 10,
  });

  const handleAddNewColor = () => {
    if (newColor.name.trim() === '') {
        alert('Por favor, ingrese un nombre para el nuevo color.');
        return;
    }
    onAddColor({
        ...newColor,
        price: Number(newColor.price) || 0,
        lowStockThreshold: Number(newColor.lowStockThreshold) || undefined,
    });
    // Reset form
    setShowAddForm(false);
    setNewColor({
        name: '',
        value: '#FBBF24',
        price: 0,
        lowStockThreshold: 10,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Paleta de Colores y Herramientas</h2>
      <div className="flex items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 flex-col md:flex-row">
        
        <div className="w-full md:w-auto">
            <p className="text-sm font-medium text-gray-600 mb-2">Modo Pintar (marcar disponibilidad)</p>
            <div className="flex items-center flex-wrap gap-2">
            {colors.filter(c => c.value !== '').map(color => (
                <button
                key={color.name}
                onClick={() => onColorSelect(selectedColor === color.value ? null : color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
                    selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 border-white' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={`${color.name}`}
                aria-label={`Seleccionar color ${color.name}`}
                />
            ))}
            {eraserColor && (
                <button
                    onClick={() => onColorSelect(selectedColor === eraserColor.value ? null : eraserColor.value)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
                        selectedColor === eraserColor.value ? 'ring-2 ring-offset-2 ring-blue-500 border-gray-200 bg-gray-200' : 'border-gray-300 bg-white'
                    }`}
                    title={eraserColor.name}
                    aria-label={eraserColor.name}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-gray-400 text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition"
                title="Añadir nuevo color"
                aria-label="Añadir nuevo color"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            </div>
        </div>
        
        <div className="border-t md:border-t-0 md:border-l border-gray-300 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
           <p className="text-sm font-medium text-gray-600 mb-2">Modo Editar (ingresar cantidad)</p>
           <button
             onClick={() => onColorSelect(null)}
             className={`px-4 py-2 rounded-md text-sm font-semibold transition w-full md:w-auto ${
                selectedColor === null
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
             }`}
           >
             Editar Stock
           </button>
        </div>
      </div>

    {showAddForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in-down">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Añadir Nuevo Color de Estado</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                    <label htmlFor="new-color-name" className="text-xs font-medium text-gray-600 mb-1">Nombre</label>
                    <input id="new-color-name" type="text" placeholder="Ej: Pedido Especial" value={newColor.name} onChange={(e) => setNewColor({...newColor, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"/>
                </div>
                 <div className="flex flex-col">
                    <label htmlFor="new-color-value" className="text-xs font-medium text-gray-600 mb-1">Color</label>
                    <input id="new-color-value" type="color" value={newColor.value} onChange={(e) => setNewColor({...newColor, value: e.target.value})} className="w-full h-10 p-1 border border-gray-300 rounded-md shadow-sm cursor-pointer"/>
                </div>
                 <div className="flex flex-col">
                    <label htmlFor="new-color-price" className="text-xs font-medium text-gray-600 mb-1">Precio ($)</label>
                    <input id="new-color-price" type="number" min="0" step="0.01" placeholder="0.00" value={newColor.price} onChange={(e) => setNewColor({...newColor, price: parseFloat(e.target.value)})} className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"/>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="new-color-threshold" className="text-xs font-medium text-gray-600 mb-1">Límite Bajo Stock</label>
                    <input id="new-color-threshold" type="number" min="0" placeholder="Opcional" value={newColor.lowStockThreshold} onChange={(e) => setNewColor({...newColor, lowStockThreshold: parseInt(e.target.value, 10)})} className="w-full p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"/>
                </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-4">
                 <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Cancelar</button>
                 <button onClick={handleAddNewColor} className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow">Añadir Color</button>
            </div>
        </div>
    )}

       <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Leyenda y Precios (Editable)</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
                 {colors.filter(c => c.value !== '').map(color => (
                    <div key={color.name} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: color.value}}></div>
                        <label htmlFor={`price-${color.value}`} className="text-sm text-gray-600">{color.name}:</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-sm text-gray-500">$</span>
                            <input
                                id={`price-${color.value}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={color.price}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const newPrice = e.target.valueAsNumber;
                                    if (!isNaN(newPrice) && newPrice >= 0) {
                                        onPriceChange(color.value, newPrice);
                                    }
                                }}
                                className="w-24 pl-5 pr-2 py-1 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                aria-label={`Precio para ${color.name}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
       </div>

      {selectedColor !== null && (
        <p className="mt-3 text-sm text-blue-700 bg-blue-50 p-2 rounded-md">
          <strong>Modo Pincel activado.</strong> Haga clic y arrastre sobre la grilla para aplicar el color. Para salir, haga clic en "Editar Stock".
        </p>
      )}
    </div>
  );
};