import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LedsLigados from './pages/LedsLigados/LedsLigados';
import Historico from './pages/Historico/Historico';
import './App.css';

function App() {
  const [faixaAtual, setFaixaAtual] = useState("--");

  return (
    <HashRouter>
      <div className="layout-principal">
        <Header faixaAtual={faixaAtual} />
        
        <main className="conteudo-principal">
          <Routes>
            <Route path="/" element={<LedsLigados setFaixaAtual={setFaixaAtual} />} />
            <Route path="/historico" element={<Historico />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;