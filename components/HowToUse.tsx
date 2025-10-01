
import React from 'react';

interface HowToUseProps {
  onClose: () => void;
}

export const HowToUse: React.FC<HowToUseProps> = ({ onClose }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 relative animate-fade-in-down">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-blue-500 hover:text-blue-700"
        aria-label="Cerrar ayuda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Guía Rápida de Uso</h2>
          <p className="text-gray-600 mb-4">
            Este programa le permite gestionar un inventario de lentes ópticos. Cada combinación de características de un lente tiene su propia grilla de stock.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full text-white text-xs font-bold w-5 h-5 flex items-center justify-center mr-3 mt-1">1</span>
              <div>
                <h3 className="font-semibold text-gray-700">Seleccione las Características del Lente</h3>
                <p className="text-gray-600 text-sm">Use los menús desplegables en la sección "Configuración de Lente" para elegir las propiedades (Foco, Material, Color, etc.). La grilla de abajo se actualizará para mostrar el inventario de esa combinación específica.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full text-white text-xs font-bold w-5 h-5 flex items-center justify-center mr-3 mt-1">2</span>
              <div>
                <h3 className="font-semibold text-gray-700">Modo Pintar: Defina la Disponibilidad</h3>
                <p className="text-gray-600 text-sm">Seleccione un color de la paleta. Luego, haga clic en las celdas de la grilla para "pintarlas". Una celda con color significa que el lente con esa graduación esférica y cilíndrica <strong className="font-bold">existe y está disponible</strong>. Para quitar el color, vuelva a hacer clic con el mismo color seleccionado. Para borrar, use el ícono de la papelera.</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 rounded-full text-white text-xs font-bold w-5 h-5 flex items-center justify-center mr-3 mt-1">3</span>
              <div>
                <h3 className="font-semibold text-gray-700">Modo Editar: Ingrese el Stock</h3>
                <p className="text-gray-600 text-sm">Haga clic en el botón "Editar Stock". El modo pintar se desactivará. Ahora, puede hacer clic en cualquier celda <strong className="font-bold">que ya esté coloreada</strong> para ingresar la cantidad de unidades en stock. Presione 'Enter' o haga clic fuera para guardar.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
