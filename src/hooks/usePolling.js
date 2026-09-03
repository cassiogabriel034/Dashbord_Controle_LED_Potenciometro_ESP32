// 1. Importações
// useState: Cria variáveis reativas que, ao mudarem de valor, forçam o componente visual a se redesenhar na tela[cite: 1].
// useEffect: Executa efeitos colaterais (operações fora do fluxo normal de renderização, como chamadas de rede e temporizadores)[cite: 1].
// useRef: Cria uma referência mutável que guarda um valor durante todo o ciclo de vida do componente sem disparar uma nova renderização quando o seu conteúdo interno for alterado[cite: 1].
import { useState, useEffect, useRef } from 'react';

/**
 * Declara a função do Custom Hook recebendo dois parâmetros:
 * @param {string} url - A rota da API que será consultada (ex: http://localhost:8000/api/dados/atual)[cite: 1].
 * @param {number} [intervaloEmMs=2000] - Tempo entre cada busca periódica em milissegundos. Se não for informado, assume o padrão de 2000 ms (2 segundos)[cite: 1].
 */
function usePolling(url, intervaloEmMs = 2000) {

  // 2. Declaração de Estados e da Referência
  // dados: Armazena o JSON devolvido pelo FastAPI (como a faixa atual e o status dos LEDs). Inicia como null porque nenhuma requisição foi feita ainda[cite: 1].
  const [dados, setDados] = useState(null);

  // erro: Guarda mensagens de texto com eventuais falhas (ex: status 404, erro de conexão). Começa como null[cite: 1].
  const [erro, setErro] = useState(null);

  // statusConexao: Uma string amigável ("Conectando...", "Servidor Local Online", "Offline...") para alimentar indicadores visuais na interface[cite: 1].
  const [statusConexao, setStatusConexao] = useState("Conectando...");
  
  // Cria o ponteiro pollingRef que guardará o identificador (ID numérico) do temporizador setInterval.
  // Usar useRef aqui é crucial para conseguirmos pausar ou destruir esse timer mais tarde[cite: 1].
  const pollingRef = useRef(null);

  // 3. O Efeito Colateral (useEffect)
  // O bloco do useEffect é executado logo após o componente ser montado e exibido na tela pela primeira vez[cite: 1].
  useEffect(() => {

    // Função assíncrona interna que executa a transação de rede[cite: 1]
    const buscarDados = async () => {
      try {
        // Realiza uma requisição GET nativa do navegador para o endereço informado[cite: 1]
        const resposta = await fetch(url);
        
        // O fetch nativo só considera erro se houver falha de rede total. Se o servidor responder 404 ou 500, ele não cai no catch automaticamente[cite: 1].
        // Essa checagem manual garante que status de erro disparem a exceção (throw new Error)[cite: 1].
        if (!resposta.ok) {
          throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        // Converte o fluxo de texto bruto recebido no formato de objeto JavaScript utilizável[cite: 1]
        const json = await resposta.json();

        // Atualiza o estado da aplicação com os dados novos da API[cite: 1]
        setDados(json);

        // Se uma requisição anterior falhou mas esta deu certo, limpa a mensagem de erro[cite: 1]
        setErro(null);

        // Informa à interface que o backend está saudável[cite: 1]
        setStatusConexao("Servidor Local Online");
        
      } catch (err) {
        // Captura falhas de conexão (por exemplo, se o Uvicorn cair ou a porta estiver fechada)[cite: 1].
        console.error("Falha na comunicação com a API:", err);

        // Atualiza a interface com a mensagem de erro e marca a conexão como "Offline", impedindo que a aplicação trave em uma tela branca[cite: 1].
        setErro(err.message);
        setStatusConexao("Offline - Falha de comunicação");
      }
    };

    // 4. Inicialização e Agendamento do Polling
    // Dispara a função buscarDados imediatamente no milissegundo em que o componente abre[cite: 1].
    // Sem essa linha, a tela ficaria vazia ou exibindo "Conectando..." durante os primeiros 2 segundos até o primeiro intervalo disparar[cite: 1].
    buscarDados();

    // Registra o temporizador repetitivo nativo do JavaScript (setInterval), que executará a função buscarDados a cada intervaloEmMs (2 segundos)[cite: 1].
    // O identificador desse timer é salvo em pollingRef.current[cite: 1].
    pollingRef.current = setInterval(buscarDados, intervaloEmMs);

    // 5. Função de Limpeza (Cleanup) e Dependências
    // Esta é a função de limpeza (cleanup function) do React. Ela é acionada automaticamente quando o componente é desmontado (ex: o usuário muda de rota ou fecha a aba)[cite: 1].
    // O clearInterval(pollingRef.current) encerra o loop de chamadas, impedindo vazamento de memória (memory leak) e requisições fantasmas em segundo plano[cite: 1].
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };

  // Array de dependências: diz ao React que ele só deve reiniciar todo esse ciclo se a url ou o tempo de intervaloEmMs mudarem de valor[cite: 1].
  // Caso contrário, ele mantém o loop existente rodando estavelmente[cite: 1].
  }, [url, intervaloEmMs]);

  // 6. Retorno do Hook
  // Devolve os três estados empacotados em um objeto para qualquer componente consumidor utilizar (ex: const { dados, statusConexao } = usePolling(...))[cite: 1].
  return { dados, erro, statusConexao };
}

// Permite importar e reutilizar essa lógica de polling em qualquer arquivo do projeto React[cite: 1].
export default usePolling;