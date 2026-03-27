import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';

const COLORS = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
];

export function PersonInput() {
  const [name, setName] = useState('');
  const addPerson = useTabStore((state) => state.addPerson);
  const people = useTabStore((state) => state.people);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPerson = {
      id: Date.now().toString(),
      name: name.trim(),
      color: COLORS[people.length % COLORS.length]
    };

    addPerson(newPerson);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full mt-2">
      <input
        type="text"
        placeholder="Nome do participante..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
      />
      <button 
        type="submit"
        disabled={!name.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm"
      >
        <Plus size={20} />
      </button>
    </form>
  );
}
