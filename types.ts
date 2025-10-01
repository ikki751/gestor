export interface CellData {
  stock: number;
  color: string;
}

export type CylinderData = Record<string, CellData>;
export type GridData = Record<string, CylinderData>;
export type InventoryData = Record<string, GridData>;

export interface LensFilters {
  foco: string;
  material: string;
  color: string;
  fotocromatico: string;
  tratamiento: string;
  diametro: string;
  adicion: string;
  indiceRefraccion: string;
}

export interface ActiveCell {
  sph: string;
  cyl: string;
}

export interface ColorInfo {
  name: string;
  value: string;
  textColor?: string;
  price: number;
  lowStockThreshold?: number;
}