import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle2, X, QrCode, LogOut } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';

export function SummaryView({ onClose, isWaiter, tableCode }) {
  const [copiedPersonId, setCopiedPersonId] = useState(null);
  const [qrPersonId, setQrPersonId] = useState(null);
  
  const people = useTabStore((state) => state.people);
  const consumedItems = useTabStore((state) => state.consumedItems);
  const pixKey = useTabStore((state) => state.pixKey);
  const setPixKey = useTabStore((state) => state.setPixKey);
  const status = useTabStore((state) => state.status);

  const [tippingPeople, setTippingPeople] = useState(
    people.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );

  const togglePersonTip = (personId) => {
    if(status === 'closed') return;
    setTippingPeople(prev => ({ ...prev, [personId]: !prev[personId] }));
  };

  const calculateDebts = () => {
    const debts = {};
    people.forEach(p => debts[p.id] = 0);
    consumedItems.forEach(item => {
      if (item.sharedBy.length > 0) {
        const splitAmount = item.price / item.sharedBy.length;
        item.sharedBy.forEach(personId => {
          if (debts[personId] !== undefined) debts[personId] += splitAmount;
        });
      }
    });
    return debts;
  };

  const debts = calculateDebts();
  const subtotal = consumedItems.reduce((acc, item) => acc + item.price, 0);
  
  const getFinalAmount = (personId, baseAmount) => tippingPeople[personId] ? baseAmount * 1.1 : baseAmount;
  
  const totalTip = people.reduce((acc, p) => acc + (tippingPeople[p.id] ? debts[p.id] * 0.1 : 0), 0);
  const total = subtotal + totalTip;

  const handleCopyPix = (personId, amount) => {
    const finalAmount = getFinalAmount(personId, amount);
    const text = `Sua parte da conta deu R$ ${finalAmount.toFixed(2).replace('.', ',')}.\nChave PIX: ${pixKey || '(Não informada)'}`;
    navigator.clipboard.writeText(text);
    setCopiedPersonId(personId);
    setTimeout(() => setCopiedPersonId(null), 2000);
  };

  const handleCloseServer = async () => {
    if(!window.confirm('Atenção: Deseja realmente encerrar a mesa no Caixa? Ninguém mais poderá mexer nela.')) return;
    try {
      await fetch(`/tables/${tableCode}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_amount: subtotal, tip_amount: totalTip })
      });
      alert('Mesa fechada! Faturamento enviado ao Painel Central.');
      window.location.href = '/waiter';
    } catch(e) { console.error(e) }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 p-4 sm:p-0 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Fechamento</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {status !== 'closed' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Chave PIX de Recebimento:</label>
              <input type="text" placeholder="Ex: CPF, Email, Celular..." value={pixKey} onChange={(e) => setPixKey(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" />
            </div>
          )}

          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Rateio Individual</h3>
            <div className="space-y-4">
              {people.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhuma pessoa participou da mesa.</p>}
              {people.map(person => {
                const baseAmount = debts[person.id];
                const finalAmount = getFinalAmount(person.id, baseAmount);
                const isTipping = tippingPeople[person.id];
                
                return (
                  <div key={person.id} className="flex flex-col p-4 rounded-2xl bg-white border border-gray-100 shadow-sm gap-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-800 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${person.color}`}></div>{person.name}
                        </span>
                        <label className={`flex items-center gap-2 text-xs font-medium mt-1 ${status==='closed'?'text-gray-400 opacity-70':'text-gray-500 cursor-pointer hover:text-gray-700'}`}>
                          <input type="checkbox" disabled={status==='closed'} checked={isTipping} onChange={() => togglePersonTip(person.id)} className="rounded text-blue-600 w-3.5 h-3.5" />
                          Gorjeta +R$ {(baseAmount * 0.1).toFixed(2).replace('.', ',')}
                        </label>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-black text-gray-900 text-xl">R$ {finalAmount.toFixed(2).replace('.', ',')}</span>
                        {status !== 'closed' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setQrPersonId(person.id)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600" title="Ver QR Code PIX"><QrCode size={18} /></button>
                            <button onClick={() => handleCopyPix(person.id, baseAmount)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600" title="Copiar Cobrança"><Copy size={18} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal QR Code Tela Cheia */}
        {qrPersonId && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6 bg-blue-900/95 backdrop-blur-md animate-in fade-in zoom-in-95">
             <button onClick={() => setQrPersonId(null)} className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all shadow-xl border border-white/20"><X size={24} /></button>
             <h2 className="text-3xl font-black text-white mb-2 text-center tracking-tight">Pague via PIX</h2>
             <p className="text-blue-200 mb-8 font-medium text-center text-sm">Mostre esta tela para usar a câmera do app do seu banco e pagar fácil.</p>
             <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative">
               <QRCode value={`00020101021126580014br.gov.bcb.pix0136${pixKey||'SEMCHAVE'}5204000053039865405${getFinalAmount(qrPersonId, debts[qrPersonId]).toFixed(2)}5802BR5913Racha a Conta`} size={220} />
             </div>
             <p className="text-[10px] font-mono font-bold text-blue-300 mt-6 max-w-xs text-center break-all opacity-60">Payload: PIX:{pixKey||'???'} - R${getFinalAmount(qrPersonId, debts[qrPersonId]).toFixed(2)}</p>
          </div>
        )}

        <div className="p-6 bg-gray-900 border-t flex justify-between items-center text-white">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 font-bold text-sm tracking-tight">Total Arrecadado</span>
          </div>
          <div className="text-2xl font-black text-green-400">R$ {total.toFixed(2).replace('.', ',')}</div>
        </div>

        {isWaiter && status !== 'closed' && (
          <div className="px-6 py-4 bg-gray-900 border-t border-gray-800">
             <button onClick={handleCloseServer} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg transition-transform active:scale-[0.98] shadow-lg flex justify-center items-center gap-2">
                <LogOut size={20}/> Encerrar Oficialmente no Caixa
             </button>
             <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Ação irreversível na Sessão</p>
          </div>
        )}
      </div>
    </div>
  );
}
