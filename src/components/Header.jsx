import React from 'react';
import { useTabStore } from '../store/useTabStore';

export function Header() {
  const consumedItems = useTabStore((state) => state.consumedItems);
  const isTipEnabled = useTabStore((state) => state.isTipEnabled);
  const tipPercentage = useTabStore((state) => state.tipPercentage);

  const subtotal = consumedItems.reduce((acc, item) => acc + item.price, 0);
  const total = isTipEnabled ? subtotal * (1 + tipPercentage / 100) : subtotal;

  return (
    <header className="p-4 bg-gray-900 text-white shadow-md z-10 sticky top-0 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Racha a Conta</h1>
        <p className="text-xs text-gray-400 mt-0.5">Vibecoding MVP</p>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-400">Total da Mesa</div>
        <div className="text-xl font-mono font-bold text-green-400">
          R$ {total.toFixed(2).replace('.', ',')}
        </div>
      </div>
    </header>
  );
}
