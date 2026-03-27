import React from 'react';
import { Trash2 } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';
import { cn } from '../lib/utils';

export function ConsumedItemCard({ item }) {
  const people = useTabStore((state) => state.people);
  const togglePersonInItem = useTabStore((state) => state.togglePersonInItem);
  const removeItem = useTabStore((state) => state.removeItem);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex justify-between items-start select-none">
        <div>
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <span className="text-sm font-medium text-gray-500">
            R$ {item.price.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <button 
          onClick={() => removeItem(item.id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="pt-2 border-t border-gray-50">
        <p className="text-xs text-gray-400 mb-2">Quem consumiu?</p>
        <div className="flex flex-wrap gap-2">
          {people.length === 0 && (
            <span className="text-xs text-gray-400 italic">Adicione pessoas à mesa</span>
          )}
          {people.map(person => {
            const isSelected = item.sharedBy.includes(person.id);
            return (
              <button
                key={person.id}
                onClick={() => togglePersonInItem(item.id, person.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border",
                  isSelected 
                    ? cn(person.color, "text-white border-transparent") 
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] uppercase",
                  isSelected ? "bg-white/20" : "bg-gray-200"
                )}>
                  {person.name.charAt(0)}
                </div>
                <span>{person.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
