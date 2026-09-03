import React from 'react';
import usePolling from '../../hooks/usePolling';
import './Historico.css';

const API_URL_HISTORICO = "http://localhost:8000/api/dados/historico";

function Historico() {
  const { dados, statusConexao } = usePolling(API_URL_HISTORICO, 3000);
  const registros = Array.isArray(dados) ? dados : [];

  return (
    <div className="painel-historico-container">
      <div className="historico-header">
        <h2>Logs de Transição dos LEDs</h2>
        <span className="status-discreto">{statusConexao}</span>
      </div>

      <div className="tabela-wrapper">
        <table className="tabela-historico">
          <thead>
            <tr>
              <th>ID</th>
              <th>LED Ativo</th>
              <th>Faixa</th>
              <th>Leitura Bruta</th>
              <th>Data e Hora</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan="5" className="tabela-vazia">Nenhum evento registrado ainda.</td>
              </tr>
            ) : (
              registros.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>
                    <span className={`indicador-tabela led-cor-${item.led_ligado}`}>
                      LED {item.led_ligado}
                    </span>
                  </td>
                  <td>Faixa {item.faixa_atual}</td>
                  <td>{item.leitura_bruta}</td>
                  <td>{item.data_hora}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Historico;