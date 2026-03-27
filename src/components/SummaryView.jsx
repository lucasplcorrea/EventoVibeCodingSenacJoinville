import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle2, X, QrCode } from 'lucide-react';
import { useTabStore } from '../store/useTabStore';

export function SummaryView({ onClose }) {
  const [copiedPersonId, setCopiedPersonId] = useState(null);
  const [qrPersonId, setQrPersonId] = useState(null);
  
  const people = useTabStore((state) => state.people);
  const consumedItems = useTabStore((state) => state.consumedItems);
  const pixKey = useTabStore((state) => state.pixKey);
  const setPixKey = useTabStore((state) => state.setPixKey);

  // Estado Local: Quem vai pagar a gorjeta (começa todos habilitados)
  const [tippingPeople, setTippingPeople] = useState(
    people.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );

  const togglePersonTip = (personId) => {
    setTippingPeople(prev => ({ ...prev, [personId]: !prev[personId] }));
  };

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
  
  const getFinalAmount = (personId, baseAmount) => {
    return tippingPeople[personId] ? baseAmount * 1.1 : baseAmount;
  }

  const total = people.reduce((acc, p) => acc + getFinalAmount(p.id, debts[p.id]), 0);

  const handleCopyPix = (personId, amount) => {
    const finalAmount = getFinalAmount(personId, amount);
    const text = `Opa! Sua parte da conta fechou em R$ ${finalAmount.toFixed(2).replace('.', ',')}.\nChave PIX: ${pixKey || '(Não informada)'}`;
    navigator.clipboard.writeText(text);
    setCopiedPersonId(personId);
    setTimeout(() => setCopiedPersonId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/60 p-4 sm:p-0 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Resumo final</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Chave PIX de quem vai receber:</label>
            <input 
              type="text" 
              placeholder="Ex: CPF ou Celular" 
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Fechamento Individual</h3>
            <div className="space-y-4">
              {people.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Ninguém pagando.</p>
              ) : (
                people.map(person => {
                  const baseAmount = debts[person.id];
                  const finalAmount = getFinalAmount(person.id, baseAmount);
                  const isTipping = tippingPeople[person.id];
                  const isShowingQr = qrPersonId === person.id;
                  
                  return (
                    <div key={person.id} className="flex flex-col p-4 rounded-2xl bg-white border border-gray-100 shadow-sm gap-3">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-800 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${person.color}`}></div>
                            {person.name}
                          </span>
                          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer mt-1">
                            <input 
                              type="checkbox" 
                              checked={isTipping} 
                              onChange={() => togglePersonTip(person.id)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            Incluir 10% (R$ {(baseAmount * 0.1).toFixed(2).replace('.', ',')})
                          </label>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-black text-gray-900 text-xl">
                            R$ {finalAmount.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setQrPersonId(isShowingQr ? null : person.id)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${isShowingQr ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                              title="Mostrar Código PIX"
                            >
                              <QrCode size={18} />
                            </button>
                            <button 
                              onClick={() => handleCopyPix(person.id, baseAmount)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${copiedPersonId === person.id ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                              title="Copiar texto de Cobrança"
                            >
                              {copiedPersonId === person.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mock de Geração do QR Code */}
                      {isShowingQr && (
                        <div className="mt-2 p-5 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 transition-all relative overflow-hidden">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Escaneie pelo App do Banco</p>
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                             <QRCode 
                               value={`00020101021126580014br.gov.bcb.pix0136${pixKey || 'SEMCHAVE'}5204000053039865405${finalAmount.toFixed(2)}5802BR5913Racha a Conta6009VibeCoding62070503***6304`} 
                               size={160}
                             />
                          </div>
                          <p className="text-[10px] font-mono text-gray-400 mt-4 break-all w-full text-center opacity-70">
                            Payload Mockado:<br/>
                            PIX:{pixKey || '[CHAVE]'}:AMT:{finalAmount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </div>

        <div className="p-6 bg-gray-900 border-t flex justify-between items-center text-white">
          <div className="flex flex-col">
            <span className="text-gray-400 font-medium text-sm">Total Arrecadado</span>
            <span className="text-xs text-gray-500">Subtotal puros: R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            R$ {total.toFixed(2).replace('.', ',')}
          </div>
        </div>

      </div>
    </div>
  );
}
