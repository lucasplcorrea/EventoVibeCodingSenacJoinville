# 🚀 Racha a Conta - Vibecoding MVP

Um aplicativo completo e em tempo real de gestão de comandas e divisão de contas, construído interativamente como um Produto Mínimo Viável (MVP) durante o evento **Vibecoding do Senac Joinville**.

O grande diferencial do *Racha a Conta* é operar de forma leve e nativa em ambientes de rede local (LAN), dividindo as intenções de uso e permissões entre os clientes sentados e os Garçons através da mesma URL - contornando firewalls em tempo real.

---

## ✨ Funcionalidades Principais

- ⚡ **Sincronização Real-time:** Tudo alimentado via WebSockets no background. Quando um cliente na mesa "MESA-04" adiciona uma "Porção de Fritas", todos os outros celulares à mesa e o Administrador presenciam o item subir dinamicamente na tela.
- 🎯 **Separação de Papéis:**
  - **Garçom/Restaurante:** Dashboard analítico e segregado. Apresenta o status em painéis de "Mesas Ativas", "Caixa / Faturamento Diário (Receita e Gorjetas extras)" e "Gestão da Equipe".
  - **Mesa/Consumidor:** Interface clean *mobile-first*. Focada na praticidade de apontar "quem comeu o que" para abater em formato dinâmico o subtotal de cada membro da mesa.
- 💸 **Pagamento Mágico e Descentralizado:** O encerramento definitivo da comanda calcula individualmente a fatia de cada um. Cada pessoa escolhe por si mesma se irá arcar ou não com o valor dos 10% (Gorjeta). O sistema refaz os cálculos e renderiza imediatamente um **Mock via QR Code dinâmico do PIX Fullscreen**, centralizando e mastigando a cobrança para a roda de amigos.
- 📊 **Ranking de Desempenho Interno:** Cada mesa passa a ser "ancorada" a um Garçom específico da casa. O fechamento envia os valores transacionados para a aba de Fluxo de Caixa, computando individualmente e elaborando o Ranking de quem movimentou mais vendas e atendeu e lucrou mais gorjetas com seus serviços no dia.

---

## 🛠️ Tecnologias Utilizadas

**Frontend (Client Local):**
- [ReactJS](https://react.dev/) + [ViteJS](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) (Design limpo, utilitário, e componentes responsivos avançados)
- [Zustand](https://github.com/pmndrs/zustand) (Para gerenciar a pesada e frenética máquina de estado local)
- [Lucide React](https://lucide.dev/) (Para iconografia modular e fluída)
- `socket.io-client` para gerenciar a camada em tempo real do Browser.

**Backend (API + Live Server):**
- [Node.js](https://nodejs.org/) com framework [ExpressJS](https://expressjs.com/)
- [Socket.io](https://socket.io/) (Para broadcastings por Salas de Mesas)
- Um ecossistema de Rotas REST construídas para o C.R.U.D de relatórios operacionais.
- Proxy Reverso acoplado artificialmente (*via config do Vite*) para simular requisições relativas em LAN, impedindo o bloqueio por firewall de PCs que restrinjam a porta do Express (3000) e forçando tunelamento limpo pela 5173.

**Banco de Dados Relacional:**
- [PostgreSQL](https://www.postgresql.org/) (Conteinerizado de forma flexível via Docker na porta 5444 com amarrações de `Foreign Keys` e Cascades entre *waiters*, *tables* e *items*)

---

## 🚀 Como Executar do Zero

Construímos um script `.bat` de automação apelidado de **"INICIAÇÃO EM UM CLIQUE"** para poupar digitações complexas durante a sua demonstração/palco.

1. Inicie o Daemon do **Docker Desktop** no seu Windows.
2. Na raiz da pasta deste projeto, dê um duplo-clique no executável **`start.bat`** (ou execute `.\start.bat` no seu PowerShell).

**O que este script da mágica fará por você:**
1. Vai rastrear ativamente e "matar" quaisquer instâncias pesadas da porta 3000 ou 5173 antigas.
2. Invoará o ecossistema `docker-compose up -d` para puxar o Postgres e persistir as alterações da nuvem na máquina fresca.
3. Inicializará o Servidor Rest (NodeJS) em um console lateralizado.
4. Inicializará a Renderização Client (ViteJS) em outro console lateralizado liberando IP na LAN.

### 📱 Passo-a-passo: Testando Sockets pela Rede Local
1. Deixe o script rodar. Quando concluído, olhe o log do terminal do Frontend e verifique seu Roteamento Local (Ex: `Network: http://192.168.1.15:5173/`).
2. Digite em uma aba do seu computador pessoal: `http://localhost:5173/waiter`.
3. Navegue na guia de Painel "Equipe" para inventar um novo Garçom rápido ("Roberto").
4. Volte nas "Mesas", e abra sua sala apontando para o seu Garçom. Ele te dará um **CÓDIGO: EX: MESA-UM**.
5. No Google Chrome do *seu Celular (conectado ao mesmo WIFI)* digite aquele seu IP do terminal: `http://192.168.1.15:5173/`.
6. Logue com o código **`MESA-UM`**, e veja a mágica da sincronia Vibecoding acontecendo à medida em que você manuseia em dois dispositivos distintos! 

> Encerrar Oficialmente no Caixa a partir do Computador injetará os sub-totais como Metadados lá na sua ABA "CAIXA / DIÁRIO" agrupados pelo seu garçom! Divirta-se :)
