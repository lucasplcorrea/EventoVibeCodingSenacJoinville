import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';

export function AddItemForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const addItem = useTabStore((state) => state.addItem);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price.replace(',', '.'));
    if (!name.trim() || isNaN(numericPrice) || numericPrice <= 0) return;

    addItem({
      id: Date.now().toString(),
      name: name.trim(),
      price: numericPrice,
      sharedBy: [] // Começa sem ninguém assinando
    });

    setName('');
    setPrice('');
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <PlusCircle size={18} className="text-gray-500" />
        Adicionar Item Consumido
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ex: Porção de Fritas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-[2] px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="flex-[1] relative">
            <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={!name.trim() || !price.trim()}
          className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Adicionar à Conta
        </button>
      </form>
    </div>
  );
}
