import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { WaiterView } from './pages/WaiterView';
import { TableView } from './pages/TableView';

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen text-gray-900 font-sans antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/waiter" element={<WaiterView />} />
          <Route path="/table/:id" element={<TableView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
