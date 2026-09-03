import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'react-bootstrap-icons';
import './Header.css';

function Header({ faixaAtual }) {
  return (
    <header className="cabecalho">
      <div className="logo-container">
        <Activity size={32} color="#4ade80" />
        <h1>Monitoramento IoT</h1>
      </div>
      <p className="aviso-faixa">Faixa Atual do Potenciômetro: {faixaAtual}</p>
      
      <nav className="menu-navegacao">
        <Link to="/">LEDs Ligados</Link>
        <Link to="/historico">Histórico de LEDs</Link>
      </nav>
    </header>
  );
}

export default Header;