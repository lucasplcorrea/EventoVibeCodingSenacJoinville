import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { PersonBadge } from '../components/PersonBadge';
import { PersonInput } from '../components/PersonInput';
import { AddItemForm } from '../components/AddItemForm';
import { ConsumedItemCard } from '../components/ConsumedItemCard';
import { SummaryView } from '../components/SummaryView';
import { useTabStore } from '../store/useTabStore';
import { ShieldCheck, UserSquare2 } from 'lucide-react';

export function TableView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isWaiter = searchParams.get('waiter') === 'true';

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const initSocket = useTabStore((state) => state.initSocket);
  const people = useTabStore((state) => state.people);
  const consumedItems = useTabStore((state) => state.consumedItems);
  const tableName = useTabStore((state) => state.tableName);
  const waiterName = useTabStore((state) => state.waiterName);
  const status = useTabStore((state) => state.status);

  useEffect(() => {
    if (id) initSocket(id);
  }, [id, initSocket]);

  return (
    <div className={`min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col relative w-full h-full md:my-4 md:rounded-3xl overflow-hidden ring-1 ring-gray-200 md:shadow-2xl transition-all ${status === 'closed' ? 'grayscale opacity-95' : ''}`}>
      <Header />

      <main className="flex-1 overflow-y-auto w-full pb-32">
        <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100 flex justify-between items-center text-sm shadow-inner relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-indigo-100/50 scale-150 transform rotate-12 z-0">
              <ShieldCheck size={80} />
           </div>
           
           <div className="flex flex-col relative z-10">
             <span className="font-extrabold text-indigo-900 text-lg leading-tight tracking-tight">
               Mesa: {tableName || 'Carregando...'}
             </span>
             <span className="font-bold text-indigo-600/80 text-xs flex items-center gap-1 mt-0.5">
               <UserSquare2 size={12}/>{waiterName ? `Garçom: ${waiterName}` : 'Requisitando Garçom...'}
             </span>
           </div>
           <button onClick={() => navigate(isWaiter ? '/waiter' : '/')} className="relative z-10 text-indigo-600 font-bold hover:underline bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100 transition-transform active:scale-95">
              Sair
           </button>
        </div>

        {status === 'closed' && (
          <div className="bg-red-50 p-4 border-b border-red-100 text-center text-red-700 font-bold flex flex-col items-center justify-center gap-1">
             <span className="uppercase tracking-widest text-[10px] text-red-500">Mesa Bloqueada</span>
             <span>Esta comanda foi 100% paga e encerrada no Caixa.</span>
          </div>
        )}

        <section className={`p-4 bg-white border-b border-gray-100 shadow-sm ${status === 'closed' ? 'pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Quem está na mesa?</h2>
            {people.length > 0 && (
              <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {people.length} pessoa(s)
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-5 min-h-[40px] items-center">
            {people.map(person => (
              <PersonBadge key={person.id} person={person} />
            ))}
            {people.length === 0 && (
              <p className="text-sm text-gray-400 italic">Ninguém adicionado ainda.</p>
            )}
          </div>
          
          {status !== 'closed' && <PersonInput />}
        </section>

        <section className={`p-4 space-y-4 ${status === 'closed' ? 'pointer-events-none' : ''}`}>
          <h2 className="text-lg font-bold text-gray-800 px-1 tracking-tight">O que foi consumido?</h2>
          
          {status !== 'closed' && <AddItemForm />}

          {consumedItems.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                Itens Consumidos ({consumedItems.length})
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

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-4 pb-safe z-20 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.15)] md:absolute isolate">
         <button 
           onClick={() => setIsSummaryOpen(true)}
           className={`w-full text-white py-4 px-4 rounded-2xl font-black text-lg transition-all shadow-lg flex justify-center items-center gap-2 active:scale-[0.98] ${isWaiter ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30 ring-1 ring-red-700/50' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 ring-1 ring-blue-700/50'}`}
         >
            {isWaiter ? 'Ir para Fechamento Oficial / Pix' : 'Ver Detalhes do Fechamento'}
         </button>
      </div>

      {isSummaryOpen && (
        <SummaryView onClose={() => setIsSummaryOpen(false)} isWaiter={isWaiter} tableCode={id} />
      )}
    </div>
  );
}
