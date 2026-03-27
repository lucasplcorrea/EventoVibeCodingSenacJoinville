import React, { useState } from 'react';
import { Copy, CheckCircle2, X } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';

export function SummaryView({ onClose }) {
  const [copiedPersonId, setCopiedPersonId] = useState(null);
  
  const people = useTabStore((state) => state.people);
  const consumedItems = useTabStore((state) => state.consumedItems);
  const isTipEnabled = useTabStore((state) => state.isTipEnabled);
  const toggleTip = useTabStore((state) => state.toggleTip);
  const pixKey = useTabStore((state) => state.pixKey);
  const setPixKey = useTabStore((state) => state.setPixKey);

  const calculateDebts = () => {
    const debts = {};
    people.forEach(p => debts[p.id] = 0);

    consumedItems.forEach(item => {
      if (item.sharedBy.length > 0) {
        const splitAmount = item.price / item.sharedBy.length;
        item.sharedBy.forEach(personId => {
          if (debts[personId] !== undefined) {
            debts[personId] += splitAmount;
          }
        });
      }
    });

    return debts;
  };

  const debts = calculateDebts();
  const subtotal = consumedItems.reduce((acc, item) => acc + item.price, 0);
  const total = isTipEnabled ? subtotal * 1.1 : subtotal;

  const handleCopyPix = (personId, amount) => {
    const finalAmount = isTipEnabled ? amount * 1.1 : amount;
    const text = `Opa! Sua parte da conta deu R$ ${finalAmount.toFixed(2).replace('.', ',')}.\nChave PIX: ${pixKey || '(Não informada)'}`;
    navigator.clipboard.writeText(text);
    setCopiedPersonId(personId);
    setTimeout(() => setCopiedPersonId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 p-4 sm:p-0 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Resumo da Conta</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
            <div>
              <p className="font-semibold text-gray-800">Gorjeta (10%)</p>
              <p className="text-xs text-gray-500">Recalcula a parte de cada um</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shadow-sm rounded-full">
              <input type="checkbox" className="sr-only peer" checked={isTipEnabled} onChange={toggleTip} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Chave PIX para quem for pagar:</label>
            <input 
              type="text" 
              placeholder="Sua chave PIX (telefone, email...)" 
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Valor por Pessoa</h3>
            <div className="space-y-3">
              {people.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma pessoa na mesa.</p>
              ) : (
                people.map(person => {
                  const baseAmount = debts[person.id];
                  const finalAmount = isTipEnabled ? baseAmount * 1.1 : baseAmount;
                  
                  return (
                    <div key={person.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${person.color}`}></div>
                          {person.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {isTipEnabled ? `Subtotal: R$ ${baseAmount.toFixed(2).replace('.', ',')}` : 'Sem gorjeta'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg">
                          R$ {finalAmount.toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                          onClick={() => handleCopyPix(person.id, baseAmount)}
                          className={`p-2 rounded-xl transition-all shadow-sm ${copiedPersonId === person.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                          title="Copiar texto com valor e PIX"
                        >
                          {copiedPersonId === person.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="text-gray-500 font-medium">Total Geral</div>
          <div className="text-2xl font-bold text-gray-900">
            R$ {total.toFixed(2).replace('.', ',')}
          </div>
        </div>

      </div>
    </div>
  );
}
