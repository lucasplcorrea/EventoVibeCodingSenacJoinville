import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io(); // Auto root for websockets

export const useTabStore = create((set, get) => ({
  tabId: null,
  tableName: '',
  waiterName: '',
  status: 'active',
  tipPercentage: 10,
  isTipEnabled: true,
  pixKey: '',
  people: [],
  consumedItems: [],
  socket: socket,

  initSocket: (tableId) => {
    set({ tabId: tableId });
    socket.emit('join_table', tableId);
    
    socket.off('table_updated');
    socket.on('table_updated', (state) => {
      if(state) {
        set({
          tableName: state.name,
          status: state.status,
          waiterName: state.waiter?.name || '...',
          people: state.people,
          consumedItems: state.consumedItems
        });
      }
    });
    
    fetch(`/tables/${tableId}`)
      .then(r => r.json())
      .then(state => {
        if(state && !state.error) {
           set({
             tableName: state.name,
             status: state.status,
             waiterName: state.waiter?.name || '...',
             people: state.people,
             consumedItems: state.consumedItems
           });
        }
      }).catch(console.error);
  },

  addPerson: (person) => socket.emit('add_person', { tableId: get().tabId, name: person.name, color: person.color }),
  removePerson: (id) => socket.emit('remove_person', { tableId: get().tabId, participantId: id }),
  addItem: (item) => socket.emit('add_item', { tableId: get().tabId, name: item.name, price: item.price }),
  removeItem: (id) => socket.emit('remove_item', { tableId: get().tabId, itemId: id }),
  togglePersonInItem: (itemId, personId) => socket.emit('toggle_share', { tableId: get().tabId, itemId, participantId: personId }),
  toggleTip: () => set((state) => ({ isTipEnabled: !state.isTipEnabled })),
  setPixKey: (key) => set({ pixKey: key }),
  resetTab: () => set({ tabId: null })
}));
