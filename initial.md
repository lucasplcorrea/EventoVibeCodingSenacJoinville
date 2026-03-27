Você é um engenheiro de software experiente e também um product thinker.
Seu objetivo é me ajudar a estruturar e evoluir um projeto simples, porém com potencial real de uso.

## 💡 Ideia do Projeto

Quero criar um sistema web simples de **divisão de conta com cardápio digital**, focado em uso rápido via celular.

A ideia é que um grupo de pessoas em uma mesa consiga:

* visualizar um cardápio digital simples
* adicionar itens consumidos
* associar itens a pessoas
* dividir a conta automaticamente (de forma proporcional ao consumo)

---

## 🎯 Objetivo do MVP

Criar uma versão funcional que:

* rode bem no navegador (mobile-first)
* possa ser hospedada na Vercel
* tenha baixo acoplamento
* seja simples o suficiente para ser construída em poucas horas

---

## 🧩 Funcionalidades principais (MVP)

* Criar uma "mesa" (sessão)
* Adicionar participantes (nome)
* Listar itens do cardápio (nome + preço)
* Adicionar itens consumidos
* Associar consumo a uma ou mais pessoas
* Calcular automaticamente quanto cada pessoa deve pagar
* Exibir resumo final por pessoa

---

## 🎨 Ideia de Frontend

* Interface simples e mobile-first
* Tela única (ou poucas telas)
* Componentes principais:

  * Lista de participantes
  * Cardápio (lista de itens)
  * Botão "adicionar item"
  * Lista de consumo
  * Resumo da divisão
* UX rápida (poucos cliques)
* Pode usar:

  * HTML + Tailwind + JavaScript
    OU
  * React (se fizer sentido)

---

## ⚙️ Ideia de Backend (duas abordagens)

### 🔹 Opção 1 (mais simples - sem backend real)

* Usar apenas localStorage
* Cada "mesa" é salva localmente
* Dados persistem no navegador

### 🔹 Opção 2 (um pouco mais evoluída)

* Backend leve (ex: API serverless na Vercel ou Supabase)
* Endpoints simples:

  * criar mesa
  * adicionar participante
  * adicionar item
  * registrar consumo
  * calcular divisão

---

## 🗄️ Ideia de Banco de Dados

### Estrutura sugerida:

* tables:

  * mesas
  * participantes
  * itens_cardapio
  * consumos

### Relações:

* uma mesa tem vários participantes
* uma mesa tem vários itens
* consumos ligam participantes a itens

### Alternativa simples:

* usar JSON estruturado (caso localStorage)

---

## 🧠 Regras de Negócio

* um item pode ser compartilhado entre várias pessoas
* o valor deve ser dividido proporcionalmente
* exibir total individual
* exibir total geral da mesa

---

## 📦 Entregáveis esperados de você

Quero que você:

1. Estruture melhor essa ideia (se necessário)
2. Sugira melhorias mantendo o projeto simples
3. Proponha uma arquitetura clara (front + back)
4. Sugira estrutura de pastas
5. Defina modelo de dados (JSON ou SQL)
6. Sugira fluxo de uso (UX)
7. Identifique possíveis diferenciais simples
8. Sugira evolução futura (sem complicar o MVP)

---

## 🚧 Restrições

* Não quero nada complexo
* Evitar dependências pesadas
* Foco em simplicidade e entrega rápida
* Código deve ser fácil de entender

---

## 🔥 Espaço para melhorias

Sinta-se livre para:

* simplificar ainda mais a ideia
* propor features inteligentes mas simples
* sugerir atalhos técnicos
* melhorar a experiência do usuário

Se algo parecer complexo demais, proponha uma alternativa mais simples.

---

## 🎯 Contexto final

Esse projeto será feito em um evento de vibe coding, então velocidade e clareza são mais importantes do que perfeição.
