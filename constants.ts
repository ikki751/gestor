import type { LensFilters, InventoryData, ColorInfo } from './types';

export const INITIAL_FILTER_OPTIONS: Record<keyof LensFilters, string[]> = {
  foco: ['Monofocal', 'Bifocal', 'Progresivo'],
  material: ['Mineral', 'Orgánico', 'Policarbonato'],
  color: ['Sin color', 'Marrón', 'Gris', 'Verde'],
  fotocromatico: ['Sin Fotocromático', 'Transitions', 'Fotocromático Genérico'],
  tratamiento: ['Sin Tratamiento', 'Antirreflejos', 'Antirrayas', 'Filtro Azul'],
  diametro: ['65', '70', '75'],
  adicion: ['0', '1.00', '1.25', '1.50', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00'],
  indiceRefraccion: ['1.523', '1.60', '1.67', '1.74'],
};

export const getInitialInventoryData = (): InventoryData => ({});

// From +10.00 to -10.00 in 0.25 steps, matching user's original grid.
export const SPHERE_VALUES: string[] = Array.from({ length: 81 }, (_, i) => (10.00 - i * 0.25).toFixed(2));
// From 0.00 to +6.50 in 0.25 steps, matching user's original grid.
export const CYLINDER_VALUES: string[] = Array.from({ length: 27 }, (_, i) => (i * 0.25).toFixed(2));

export const INITIAL_COLORS: ColorInfo[] = [
    { name: 'Eliminar', value: '', price: 0 },
    { name: 'Stock Bajo', value: '#fde047', textColor: 'text-gray-900', price: 50, lowStockThreshold: 15 }, // yellow-300
    { name: 'Stock Medio', value: '#fdba74', textColor: 'text-gray-900', price: 75, lowStockThreshold: 30 }, // orange-300
    { name: 'Stock Alto', value: '#86efac', textColor: 'text-gray-900', price: 100 }, // green-300
];