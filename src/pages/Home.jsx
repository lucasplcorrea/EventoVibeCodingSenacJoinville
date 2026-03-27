import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [tableId, setTableId] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-blue-600/5 rotate-12 scale-150 transform-gpu z-0"></div>
      
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center relative z-10 border border-gray-100">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text mb-2 tracking-tight">Racha a Conta</h1>
        <p className="text-gray-500 mb-8 font-medium">Escolha como deseja entrar</p>

        <div className="space-y-4">
          <button 
            onClick={() => navigate('/waiter')}
            className="w-full bg-gray-900 hover:bg-black text-white p-4 py-5 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all hover:-translate-y-1 shadow-md"
          >
            <Store size={24} />
            Entrar como Garçom/Restaurante
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
             <div className="flex items-center justify-center gap-2 mb-4 text-blue-800 font-semibold">
               <Users size={20} />
               Sou Cliente na Mesa
             </div>
             <div className="flex flex-col gap-3">
               <input 
                 type="text" 
                 placeholder="Digite o ID da Mesa..." 
                 value={tableId}
                 onChange={(e) => setTableId(e.target.value)}
                 className="w-full px-4 py-3.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-center tracking-wider text-gray-700 shadow-sm transition-all"
               />
               <button 
                 onClick={() => { if(tableId) navigate(`/table/${tableId}`) }}
                 disabled={!tableId}
                 className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:transform-none text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
               >
                 Acessar Minha Comanda
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
