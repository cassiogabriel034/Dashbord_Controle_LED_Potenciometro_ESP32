### PARTE 1 (Do início até o Firmware)

# 🎛️ Dashboard de Controle de LEDs por Potenciômetro (ESP32 + FastAPI + React)

Este projeto implementa uma arquitetura completa de monitoramento IoT ponta a ponta, operando tanto em rede local fechada quanto via túnel público com interface web em nuvem.

O ecossistema divide-se em três camadas modulares:
1. **`firmware_esp32`**: Microcontrolador ESP32 que realiza a leitura analógica (ADC) de um potenciômetro, aciona 4 LEDs em faixas de tensão e despacha requisições HTTP POST a cada 2 segundos.
2. **`backend_iot`**: API assíncrona desenvolvida com FastAPI e SQLite em modo concorrente (WAL) para receber, validar com esquemas estritos (Pydantic) e persistir os dados brutos e temporais.
3. **`frontend_iot`**: Painel responsivo em React (Vite + JavaScript) com roteamento via `HashRouter` e Polling contínuo via Custom Hook (`usePolling`), exibindo o status instantâneo dos LEDs e o histórico recente em tabela estruturada.

---

## 🏗️ Arquitetura e Fluxo de Dados

```text
[ Potenciômetro (GPIO 34) ]
             │ (Leitura ADC: 0 a 4095)
             ▼
      [ ESP32 Firmware ] ──(Aciona LEDs: 12, 14, 27, 26)
             │
             │ HTTP POST (Payload JSON)
             ▼
   [ FastAPI API (Porta 8000) ]
             │
             ├──► [ SQLite: iot_local.db ] (Modo WAL)
             │
             ▲ HTTP GET (Polling periódico)
             │
      [ Dashboard React ] ──► Visualização em tempo real & Logs

```

---

## ⚙️ 1. Back-end (`backend_iot`)

A API gerencia o recebimento das leituras e fornece endpoints para consumo do frontend.

### Pré-requisitos

* Python 3.10+ instalado.

### Configuração e Execução

1. Abra o terminal na pasta do backend:
```bash
cd backend_iot

```


2. Crie e ative o ambiente virtual isolado (`.venv`):
* **Windows:**
```powershell
python -m venv .venv
.\.venv\Scripts\activate

```


* **Linux/Mac:**
```bash
python3 -m venv .venv
source .venv/bin/activate

```




3. Instale as dependências:
```bash
pip install -r requirements.txt

```


4. Inicialize a tabela do banco SQLite:
```bash
python database.py

```


5. Inicie o servidor FastAPI acessível para a rede:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```



* **Documentação Swagger interativa:** `http://localhost:8000/docs`
* **Endpoint de leitura atual:** `GET /api/dados/atual`
* **Endpoint de histórico:** `GET /api/dados/historico`
* **Endpoint de ingestão:** `POST /api/dados`

---

## 🔌 2. Firmware ESP32 (`firmware_esp32`)

O firmware lê o pino analógico 34 (ADC1), calcula a faixa (0 a 3), chaveia os LEDs nos pinos 12, 14, 27 e 26, e transmite o pacote via HTTP POST.

### Execução Local (VS Code + PlatformIO + Wokwi Extension)

1. Instale as extensões **PlatformIO IDE** e **Wokwi Simulator** no VS Code.
2. Certifique-se de que os arquivos `wokwi.toml` e `diagram.json` estão na raiz da pasta do firmware.
3. No arquivo `src/main.cpp`, aponte a URL do servidor:
```cpp
// Para execução na mesma máquina/rede local:
const char* serverUrl = "http://SEU_IP_LOCAL:8000/api/dados";

```


4. Clique no ícone de **Build (✔️)** na barra inferior do PlatformIO para compilar o binário (`firmware.bin`).
5. Abra o arquivo `diagram.json`, aperte `F1`, digite **`Wokwi: Start Simulator`** e pressione Enter.

### Execução no Wokwi Web (Navegador)

Caso execute o circuito diretamente pelo navegador (`wokwi.com`):

* Se o backend estiver rodando localmente sem túnel, execute o **Wokwi Bridge** em seu computador físico e conecte o navegador a `127.0.0.1:9012`.
* Se o backend estiver exposto via Tailscale Funnel, substitua `serverUrl` pela URL pública com HTTPS:
```cpp
const char* serverUrl = "https://seu-dominio.tailscale.net/api/dados";

```



```

---

### PARTE 2 (Do Frontend até o final)

```markdown
## 💻 3. Front-end Dashboard (`frontend_iot`)

Construído com React e Vite, dispensando frameworks de CSS no HTML e utilizando Flexbox nativo para visualização responsiva.

### Dependências
```bash
npm install react-router-dom react-bootstrap-icons

```

### Rodando Localmente

1. Acesse o diretório do frontend:
```bash
cd frontend_iot

```


2. Instale os pacotes:
```bash
npm install

```


3. Inicie o servidor Vite liberando acesso na rede interna:
```bash
npm run dev -- --host

```


4. Acesse no navegador local: `http://localhost:5173` (ou use o endereço IP de rede mostrado no terminal para acessar pelo smartphone).

---

## 🚀 4. Guia de Deploy no GitHub Pages

O frontend pode ser compilado como site estático e hospedado gratuitamente no GitHub Pages.

### Configuração do Projeto

1. Instale o pacote `gh-pages` como dependência de desenvolvimento:
```bash
npm install gh-pages --save-dev

```


2. No `package.json`, adicione a propriedade `homepage` e os scripts de automação:
```json
"homepage": "https://cassiogabriel034.github.io/Dashbord_Controle_LED_Potenciometro_ESP32",
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

```


3. No arquivo `vite.config.js`, configure a base URL com o nome exato do repositório:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/Dashbord_Controle_LED_Potenciometro_ESP32/"
});

```



### Execução do Deploy

No terminal da pasta `frontend_iot`, execute:

```bash
npm run deploy

```

O Vite compilará os arquivos para a pasta `dist` e enviará o conteúdo para a branch `gh-pages`. No GitHub, acesse **Settings > Pages** e confirme se o site está ativo.

---

## 🌐 5. Conectando o GitHub Pages à API Local (Tailscale Funnel)

Sites hospedados no GitHub Pages rodam obrigatoriamente sobre **HTTPS**. Para que o frontend publicado consiga requisitar o backend rodando no seu computador sem erros de *Mixed Content*, utilize o **Tailscale Funnel**:

1. Inicie o backend FastAPI normalmente na porta 8000.
2. Abra o terminal (CMD/PowerShell) e execute:
```cmd
tailscale funnel 8000

```


3. O Tailscale fornecerá um link público seguro com HTTPS (exemplo: `[https://seu-dispositivo.tailnet-nome.ts.net](https://seu-dispositivo.tailnet-nome.ts.net)`).
4. Atualize as variáveis nos componentes React (`LedsLigados.jsx` e `Historico.jsx`):
```javascript
const API_URL_ATUAL = "https://seu-dispositivo.tailnet-nome.ts.net/api/dados/atual";
const API_URL_HISTORICO = "https://seu-dispositivo.tailnet-nome.ts.net/api/dados/historico";

```


5. Atualize o `serverUrl` no firmware da ESP32 com o mesmo endereço e rode `npm run deploy` novamente no frontend. Agora qualquer dispositivo com o link do GitHub Pages receberá as atualizações da ESP32 em tempo real.

```

```
