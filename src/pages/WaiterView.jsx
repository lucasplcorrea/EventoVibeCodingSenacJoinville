import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, UtensilsCrossed } from 'lucide-react';

export function WaiterView() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  
  const fetchTables = () => {
    fetch('/tables')
      .then(res => res.json())
      .then(data => setTables(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000);
    return () => clearInterval(interval);
  }, []);

  const createTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    try {
      const res = await fetch('/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName.trim() })
      });
      const data = await res.json();
      if (data.id) {
        setNewTableName('');
        fetchTables();
      }
    } catch (e) { console.error(e) }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Garçom</h1>
            <p className="text-gray-500">Gerencie as mesas ativas do restaurante</p>
          </div>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline font-medium">Voltar</button>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-end flex-wrap sm:flex-nowrap">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-semibold text-gray-700">Nova Mesa (Nome/Número)</label>
            <input 
              type="text" 
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              placeholder="Ex: Mesa 04, VIP" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={createTable} disabled={!newTableName.trim()} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            <Plus size={20} />
            Abrir Mesa
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-400">Nenhuma mesa ativa no momento.</div>
          )}
          {tables.map(table => (
            <div key={table.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{table.name}</h3>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Ativa</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Users size={16} />
                  <span>{table.people_count || 0} pessoa(s) na mesa</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="font-mono text-[13px] font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded w-full truncate" title="Passe esse código para a mesa">
                    CÓDIGO: {table.code}
                  </span>
                </div>
              </div>
              <button onClick={() => navigate(`/table/${table.code}`)} className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2">
                <UtensilsCrossed size={18} />
                Gerenciar Comanda
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
