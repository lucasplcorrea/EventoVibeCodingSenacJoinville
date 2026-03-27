import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, UtensilsCrossed, CalendarClock, UserSquare2, DollarSign, QrCode, CheckCircle2 } from 'lucide-react';

export function WaiterView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mesas');
  
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [history, setHistory] = useState({ tables: [], waiters: [] });
  
  const [newTableName, setNewTableName] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [newWaiterName, setNewWaiterName] = useState('');

  const fetchTables = () => fetch('/tables').then(r => r.json()).then(setTables).catch(console.error);
  const fetchWaiters = () => fetch('/waiters').then(r => r.json()).then(setWaiters).catch(console.error);
  const fetchHistory = () => fetch('/history/today').then(r => r.json()).then(setHistory).catch(console.error);

  useEffect(() => {
    fetchTables(); fetchWaiters(); fetchHistory();
    const interval = setInterval(() => {
      if(activeTab === 'mesas') fetchTables();
      if(activeTab === 'historico') fetchHistory();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const createTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim() || !selectedWaiter) return alert('Por favor, preencha o nome da mesa e escolha um garçom responsável.');
    try {
      const res = await fetch('/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTableName.trim(), waiter_id: selectedWaiter })
      });
      const data = await res.json();
      if (data.id) { setNewTableName(''); fetchTables(); }
      else if (data.error) alert(data.error);
    } catch (e) { console.error(e) }
  };

  const createWaiter = async (e) => {
    e.preventDefault();
    if(!newWaiterName.trim()) return;
    try {
      await fetch('/waiters', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: newWaiterName.trim() }) });
      setNewWaiterName('');
      fetchWaiters();
    } catch(e) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-8">
      <div className="max-w-4xl mx-auto w-full px-4 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel Gerencial</h1>
          <p className="text-gray-500 font-medium">Controle de Mesas e Caixas V2</p>
        </div>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Sair</button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 mb-6">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
          <button onClick={() => setActiveTab('mesas')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 rounded-xl transition-all ${activeTab === 'mesas' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><UtensilsCrossed size={18}/> Mesas Ativas</button>
          <button onClick={() => setActiveTab('historico')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 rounded-xl transition-all ${activeTab === 'historico' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><CalendarClock size={18}/> Caixa / Diário</button>
          <button onClick={() => setActiveTab('equipe')} className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 rounded-xl transition-all ${activeTab === 'equipe' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}><UserSquare2 size={18}/> Equipe</button>
        </div>
      </div>

      <div className="flex-1 bg-white/50 border-t border-gray-200 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          
          {activeTab === 'mesas' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-end flex-wrap sm:flex-nowrap">
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-bold text-gray-700">Identificação da Mesa</label>
                  <input type="text" value={newTableName} onChange={e => setNewTableName(e.target.value)} placeholder="Ex: Mesa 04, VIP" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="text-sm font-bold text-gray-700">Garçom Responsável</label>
                  <select value={selectedWaiter} onChange={e => setSelectedWaiter(e.target.value)} className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Selecione...</option>
                    {waiters.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <button onClick={createTable} disabled={!newTableName.trim() || !selectedWaiter} className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <Plus size={20} /> Abrir Mesa
                </button>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.length === 0 && <div className="col-span-full text-center py-16 text-gray-400 font-medium">Nenhuma mesa ativa no momento.</div>}
                {tables.map(table => (
                  <div key={table.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Ativa</div>
                    <h3 className="text-2xl font-black text-gray-800 mb-1 mt-2">{table.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-5 flex items-center gap-1"><UserSquare2 size={14}/> Garçom: <span className="text-gray-800 font-bold">{table.waiter_name || 'Desconhecido'}</span></p>
                    
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-500 font-medium flex items-center gap-2"><Users size={16} /> Ocupação</span>
                         <span className="font-bold text-gray-900">{table.people_count || 0} pessoas</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <span className="text-gray-500 font-medium flex items-center gap-2"><QrCode size={16} /> PIN de Acesso</span>
                         <span className="font-mono text-xs font-black text-blue-800 bg-blue-100 px-2 py-1 rounded">{table.code}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/table/${table.code}?waiter=true`)} className="w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-3.5 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-sm">
                      <UtensilsCrossed size={18} /> Abrir e Fechar Comanda
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
                 <div className="relative z-10">
                   <p className="font-bold text-green-100 mb-1 uppercase tracking-wider text-sm flex items-center gap-2"><CheckCircle2 size={16}/>Faturamento Consolidado Hoje</p>
                   <h2 className="text-5xl font-black mt-2">R$ {history.tables.reduce((acc, t) => acc + Number(t.total_amount), 0).toFixed(2).replace('.',',')}</h2>
                   <p className="mt-4 text-green-50 font-medium">Adicionais (+Gorjetas de Funcionários): R$ {history.tables.reduce((acc, t) => acc + Number(t.tip_amount), 0).toFixed(2).replace('.',',')}</p>
                 </div>
                 <DollarSign size={120} className="text-green-400 opacity-20 hidden sm:block absolute right-4 top-4 transform -rotate-12"/>
              </div>

              <h2 className="text-xl font-bold text-gray-800 pt-4 px-2">Comandas Fechadas ({history.tables.length})</h2>
              <div className="space-y-3">
                {history.tables.length === 0 && <p className="text-gray-500 text-center py-8">Nenhuma mesa foi fechada ainda hoje.</p>}
                {history.tables.map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-gray-50/50">
                     <div>
                        <h4 className="font-bold text-gray-800 text-xl flex items-center gap-2">{t.name} <span className="text-xs font-mono text-gray-400 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">#{t.code}</span></h4>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2"><CalendarClock size={14}/>Fechada às {new Date(t.closed_at).toLocaleTimeString().slice(0,5)} • Garçom: <b className="text-gray-700">{t.waiter_name}</b></p>
                     </div>
                     <div className="text-right w-full sm:w-auto p-4 sm:p-0 bg-gray-50 sm:bg-transparent rounded-2xl">
                        <p className="font-black text-2xl text-green-600">R$ {Number(t.total_amount).toFixed(2).replace('.',',')}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gorjeta Extra: R$ {Number(t.tip_amount).toFixed(2).replace('.',',')}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'equipe' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
               <form onSubmit={createWaiter} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-end flex-wrap sm:flex-nowrap">
                 <div className="flex-1 space-y-2 w-full">
                   <label className="text-sm font-bold text-gray-700">Adicionar Integrante à Equipe</label>
                   <input type="text" value={newWaiterName} onChange={e => setNewWaiterName(e.target.value)} placeholder="Nome do garçom" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <button type="submit" disabled={!newWaiterName.trim()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-blue-600/20">
                   Salvar
                 </button>
               </form>

               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-lg">Ranking e Performance de Gorjetas Diárias</h3>
                 </div>
                 <div className="divide-y divide-gray-100">
                    {history.waiters.length === 0 && <p className="text-gray-500 text-center py-10 font-medium">Nenhum garçom atendeu e fechou mesas ainda hoje.</p>}
                    {history.waiters.map((w, idx) => (
                      <div key={w.id} className="p-6 flex items-center justify-between hover:bg-indigo-50/20 transition-colors">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-indigo-200/50">{idx + 1}</div>
                            <div>
                               <h4 className="font-black text-gray-900 text-xl">{w.name}</h4>
                               <p className="text-sm text-gray-500 font-medium mt-0.5">{w.tables_served} mesas finalizadas com sucesso</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <p className="text-3xl font-black text-indigo-600"><span className="text-sm text-indigo-400 font-bold uppercase tracking-wider mr-2 hidden sm:inline-block">Gorjetas (10%)</span> R$ {Number(w.total_tips).toFixed(2).replace('.',',')}</p>
                             <p className="text-sm font-semibold text-gray-400 mt-1">Total Movimentado: R$ {Number(w.revenue).toFixed(2).replace('.',',')}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
