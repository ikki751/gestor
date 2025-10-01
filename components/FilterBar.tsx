

import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for types.
import type { LensFilters } from '../types';

interface FilterBarProps {
  filters: LensFilters;
  filterOptions: Record<keyof LensFilters, string[]>;
  onFilterChange: (filterName: keyof LensFilters, value: string) => void;
  onAddOption: (filterName: keyof LensFilters, newOption: string) => void;
}

const FilterSelect: React.FC<{
  label: string;
  name: keyof LensFilters;
  value: string;
  options: string[];
  onChange: (filterName: keyof LensFilters, value: string) => void;
  onAdd: (filterName: keyof LensFilters, newOption: string) => void;
}> = ({ label, name, value, options, onChange, onAdd }) => {
    const [showAddInput, setShowAddInput] = useState(false);
    const [newOption, setNewOption] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showAddInput) {
            inputRef.current?.focus();
        }
    }, [showAddInput]);

    const handleAdd = () => {
        const trimmedOption = newOption.trim();
        if (trimmedOption && !options.includes(trimmedOption)) {
            onAdd(name, trimmedOption);
        }
        setNewOption('');
        setShowAddInput(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAdd();
        } else if (e.key === 'Escape') {
            setNewOption('');
            setShowAddInput(false);
        }
    };

    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-600">{label}</label>
            <div className="flex items-center space-x-1">
                 <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={(e) => onChange(name, e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <button 
                    onClick={() => setShowAddInput(!showAddInput)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition"
                    title={`Añadir nueva opción a ${label}`}
                    aria-label={`Añadir nueva opción a ${label}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            {showAddInput && (
                <div className="mt-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleAdd}
                        placeholder="Nueva opción y Enter"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                    />
                </div>
            )}
        </div>
    );
};


export const FilterBar: React.FC<FilterBarProps> = ({ filters, filterOptions, onFilterChange, onAddOption }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <FilterSelect label="Foco" name="foco" value={filters.foco} options={filterOptions.foco} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Material" name="material" value={filters.material} options={filterOptions.material} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Color" name="color" value={filters.color} options={filterOptions.color} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Fotocromático" name="fotocromatico" value={filters.fotocromatico} options={filterOptions.fotocromatico} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Tratamiento" name="tratamiento" value={filters.tratamiento} options={filterOptions.tratamiento} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Diámetro" name="diametro" value={filters.diametro} options={filterOptions.diametro} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Adición" name="adicion" value={filters.adicion} options={filterOptions.adicion} onChange={onFilterChange} onAdd={onAddOption} />
      <FilterSelect label="Índice Refracción" name="indiceRefraccion" value={filters.indiceRefraccion} options={filterOptions.indiceRefraccion} onChange={onFilterChange} onAdd={onAddOption} />
    </div>
  );
};