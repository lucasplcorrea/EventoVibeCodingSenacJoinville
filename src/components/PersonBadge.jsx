import React from 'react';
import { X } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';
import { cn } from '../lib/utils';

export function PersonBadge({ person }) {
  const removePerson = useTabStore((state) => state.removePerson);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all",
      person.color,
      "text-white"
    )}>
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs uppercase">
        {person.name.charAt(0)}
      </div>
      <span>{person.name}</span>
      <button 
        onClick={() => removePerson(person.id)}
        className="ml-1 p-0.5 rounded-full hover:bg-black/20 transition-colors"
        aria-label="Remover pessoa"
      >
        <X size={14} />
      </button>
    </div>
  );
}
