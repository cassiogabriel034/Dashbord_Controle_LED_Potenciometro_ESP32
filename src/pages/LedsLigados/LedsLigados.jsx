import React, { useEffect } from 'react';
import usePolling from '../../hooks/usePolling';
import './LedsLigados.css';

// Substitua pelo IP da máquina se for testar no celular
const API_URL_ATUAL = "http://localhost:8000/api/dados/atual";

function LedsLigados({ setFaixaAtual }) {
  const { dados, erro, statusConexao } = usePolling(API_URL_ATUAL, 1500);

  // Propaga a faixa recebida para o Header do App
  useEffect(() => {
    if (dados && dados.faixa_atual !== undefined) {
      setFaixaAtual(dados.faixa_atual);
    }
  }, [dados, setFaixaAtual]);

  const ledAtivo = dados ? dados.led_ligado : 0;
  const ledsIndices = [1, 2, 3, 4];

  return (
    <div className="painel-leds-container">
      <div className="status-badge-container">
        <span className={`status-badge ${statusConexao.includes("Online") ? "badge-online" : "badge-offline"}`}>
          {statusConexao}
        </span>
      </div>

      <div className="circulos-wrapper">
        {ledsIndices.map((indice) => {
          const estaLigado = ledAtivo === indice;
          return (
            <div key={indice} className="led-item">
              <div className={`circulo-led led-${indice} ${estaLigado ? "ligado" : "desligado"}`}>
                <div className="led-brilho-interno"></div>
              </div>
              <span className="led-rotulo">LED {indice}</span>
            </div>
          );
        })}
      </div>

      <div className="telemetria-box">
        <p><strong>Última Leitura ADC:</strong> {dados ? dados.leitura_bruta : "--"} / 4095</p>
        <p><strong>Timestamp:</strong> {dados ? dados.data_hora : "--"}</p>
      </div>
    </div>
  );
}

export default LedsLigados;