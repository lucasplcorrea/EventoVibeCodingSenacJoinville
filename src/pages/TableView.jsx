import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { PersonBadge } from '../components/PersonBadge';
import { PersonInput } from '../components/PersonInput';
import { AddItemForm } from '../components/AddItemForm';
import { ConsumedItemCard } from '../components/ConsumedItemCard';
import { SummaryView } from '../components/SummaryView';
import { useTabStore } from '../store/useTabStore';

export function TableView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const initSocket = useTabStore((state) => state.initSocket);
  const people = useTabStore((state) => state.people);
  const consumedItems = useTabStore((state) => state.consumedItems);
  const tableName = useTabStore((state) => state.tableName);

  useEffect(() => {
    if (id) {
      initSocket(id);
    }
  }, [id, initSocket]);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col relative w-full h-full md:my-4 md:rounded-3xl overflow-hidden ring-1 ring-gray-200 md:shadow-2xl">
      <Header />

      <main className="flex-1 overflow-y-auto w-full pb-28">
        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center text-sm">
           <span className="font-semibold text-indigo-800">
             Mesa: {tableName || 'Carregando...'}
           </span>
           <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Sair</button>
        </div>

        {/* Participants Section */}
        <section className="p-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800">Quem está na mesa?</h2>
            {people.length > 0 && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {people.length} pessoa(s)
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] items-center">
            {people.map(person => (
              <PersonBadge key={person.id} person={person} />
            ))}
            {people.length === 0 && (
              <p className="text-sm text-gray-400 italic">Ninguém adicionado ainda.</p>
            )}
          </div>
          
          <PersonInput />
        </section>

        {/* Consumed Items Section */}
        <section className="p-4 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-1">O que foi consumido?</h2>
          
          <AddItemForm />

          {consumedItems.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
                Itens Adicionados ({consumedItems.length})
              </h3>
              <div className="flex flex-col gap-3">
                {consumedItems.map(item => (
                  <ConsumedItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-4 pb-safe z-20 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.15)] md:absolute">
         <button 
           onClick={() => setIsSummaryOpen(true)}
           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 active:scale-95"
         >
            Ver Fechamento da Conta
         </button>
      </div>

      {isSummaryOpen && (
        <SummaryView onClose={() => setIsSummaryOpen(false)} />
      )}
    </div>
  );
}
