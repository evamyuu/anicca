# Demo offline — WhatsApp → App → Painel web

Guia para apresentar a Anicca **sem internet**: tudo roda no notebook, com dados mockados
(Rosa, Lucas e Dra. Sandra) e um simulador de WhatsApp no lugar do WhatsApp real.
Tudo é **local e em tempo real**: o que chega no "WhatsApp" aparece no app e no painel na hora.

## Como funciona

```text
 Simulador WhatsApp ──► Servidor de demo (Node, porta 8000) ──► App (Expo web, 8081)
 localhost:8000/whatsapp     substitui a API FastAPI             atualiza na hora (SSE)
                                      │
                                      └──────────────────────► Painel médico (Next, 3000)
                                                                 atualiza sozinho (~2,5 s)
```

- `scripts/demo/server.mjs` responde os mesmos endpoints da API (`/api/v1/...`), então **app e
  painel não precisam de configuração** — o `.env` do app já aponta para `localhost:8000`.
- A "Ani" do simulador entende texto livre por regras (sem LLM), recebe fotos e laudos, registra
  na rotina, no Body Map, em Documentos e no Diário, e avisa o app e o painel.
- Fotos anexadas passam por uma **visão computacional simulada** que gera uma **nota clínica
  S/O/A/P** — ela aparece no detalhe do Body Map (app) e na Ficha Clínica (painel), junto da foto.
- Sem dependências extras: só Node (o mesmo usado pelo Expo).

## O que o computador precisa ter instalado

| Programa          | Versão                               | Para quê                             | Como conferir   |
| ----------------- | ------------------------------------ | ------------------------------------ | --------------- |
| **Git**           | qualquer recente                     | baixar o código                      | `git --version` |
| **Node.js**       | 20 ou mais nova (LTS 22 recomendada) | servidor de demo, app e painel       | `node -v`       |
| **pnpm**          | 9                                    | instalar as dependências do monorepo | `pnpm -v`       |
| **Google Chrome** | qualquer recente                     | as 3 janelas da demo                 | —               |

**Não precisa** de Python, Docker, Supabase, Android Studio, emulador nem conta de WhatsApp: a demo
offline não usa a API FastAPI. Se o `pnpm` não existir, instale com `npm install -g pnpm@9`
(o `npm` vem junto com o Node).

## Antes do evento (com internet)

### Se for usar este mesmo notebook

Nada a instalar. Só faça um ensaio completo (seção "Na hora") e depois **repita com o Wi-Fi desligado**.

### Se for usar outro computador

Precisa de internet **uma vez**, para baixar o código e as dependências:

```bash
node -v
```

```bash
npm install -g pnpm@9
```

```bash
git clone https://github.com/evamyuu/anicca.git
```

```bash
cd anicca
```

```bash
git switch demo/figma-hub-rotina-bodymap
```

```bash
pnpm install
```

(Se o `pnpm` não existir: `npm install -g pnpm@9`.) Depois rode a demo inteira uma vez com
internet — isso aquece o cache do Expo e do Next — e teste de novo com o Wi-Fi desligado.

Checklist do notebook: carregador, suspensão de tela desligada, notificações e atualizações do
Windows pausadas (Assistente de foco), zoom do navegador em 100%.

## Na hora — 3 comandos (PowerShell, na pasta `anicca`)

> Se a API FastAPI (uvicorn) estiver aberta, feche antes (Ctrl+C no terminal dela): a porta 8000 é do servidor de demo.

**Terminal 1 — servidor de demo:**

```bash
node scripts/demo/server.mjs
```

**Terminal 2 — app** (o `--offline` evita que o Expo tente acessar a internet):

```bash
cd apps/mobile; npx expo start --web --offline
```

**Terminal 3 — painel médico:**

```bash
cd apps/web; npx next dev
```

### Montando a tela (3 janelas lado a lado)

Abra **3 janelas separadas** do Chrome (Ctrl+N) — janelas, não abas: o app pausa a sincronização
quando a aba fica escondida. Encaixe com **Win + ← / Win + →** ou arrastando:

| Posição             | Endereço                            | Dica                                                                                                |
| ------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Esquerda (estreita) | **http://localhost:8000/whatsapp**  | Abra sempre pelo `http://` — abrindo o arquivo `whatsapp.html` direto, as imagens não carregam      |
| Meio                | **http://localhost:8081**           | F12 → Ctrl+Shift+M → "iPhone 14 Pro" para ficar com cara de celular (ou só deixe a janela estreita) |
| Direita             | **http://localhost:3000/dashboard** | Clique em **Rosa Maria Andrade** → **Ficha Clínica**                                                |

**Login no app** (qualquer senha com 6+ caracteres, ex.: `123456`):

- Paciente: `rosa@anicca.demo` (o e-mail que já vem preenchido também entra como paciente)
- Cuidador: `lucas@anicca.demo`
- Trocar de perfil: avatar → Perfil → Configurações → Sair.

**Antes de cada apresentação:** no simulador, clique em **↺ Reiniciar** (logo abaixo do celular).

Com a janela do simulador estreita, embaixo do celular ficam o status do app, o risco no painel,
o **↺ Reiniciar** e os 9 passos do roteiro como botões curtos (passe o mouse para ver a descrição).

## Roteiro principal — Body Map com visão computacional (≈ 2 min)

1. **App:** abra o **Body Map** (Rotina → "Registrar Sintomas / Body Map"). Mostre o peito (grau 2) e a lateral (grau 1) já registrados.
2. **WhatsApp:** escreva a legenda na caixa de mensagem, por exemplo _"Minha mão tá vermelha e ardendo desde ontem"_,
   clique no **📎** → **🖼️ Foto do corpo (do computador)…** e escolha **qualquer foto** (deixe uma separada na Área de Trabalho).
   A legenda define a análise: _pinta/sinal/mancha escura_ → lesão pigmentada (ABCDE); _mão/pé_ → síndrome mão-pé;
   _braço_ → flebite pós-quimio; outras → irritação de pele.
   Sem foto à mão? Use **📷 Exemplo: pinta na pele**: foto real de uma lesão pigmentada que a visão computacional
   classifica como atípica (ABCDE), com alerta **alto** no painel e encaminhamento à dermatologia.
3. **App, na hora:** aparece o aviso _"Novo sintoma via WhatsApp"_ e a região fica colorida. Toque em **Histórico** → no registro → a tela de detalhes mostra a **foto + nota clínica S/O/A/P**.
4. **Painel:** em segundos, a **Ficha Clínica** da Rosa mostra a foto e a mesma nota em _Sintomas Recentes_, e o resumo clínico se atualiza.
5. **Painel — IA clínica:** pergunte _"E a foto?"_ (ou _"E a pinta?"_, _"E a foto do braço?"_). A resposta traz raciocínio, conduta e **Fontes e Referências**: contexto da paciente + artigos do PubMed.

## Roteiro completo (botões numerados no simulador)

| #   | No simulador de WhatsApp                                | No app                                                                | No painel                                                                                           |
| --- | ------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | 💬 "Bom dia, Ani! Tomei a Ondansetrona agora"           | Rotina 2/6 → **3/6**; Home "3 de 5"; tarefa do Lucas se marca sozinha | —                                                                                                   |
| 2   | 💬 "Bebi 2 copos de água"                               | Rotina → Hidratação **6/8**                                           | —                                                                                                   |
| 3   | 📎 Foto do hemograma                                    | Docs: "Hemograma completo" chega **via WhatsApp**                     | —                                                                                                   |
| 4   | 💬 "Tô sentindo uma dor no peito, lado direito, nota 7" | Body Map: peito **grau 4** + aviso                                    | Sintomas recentes + risco **ALTO** + sugestão de ECG/troponina                                      |
| 5   | 📎 Foto do corpo — qualquer imagem                      | Body Map + detalhes com foto e nota                                   | Foto + nota clínica S/O/A/P                                                                         |
| 6   | 📷 Foto de pinta na pele (exemplo pronto)               | Body Map: costas, com foto + nota                                     | Alerta **alto** "lesão pigmentada atípica (ABCDE)" + foto e nota; IA sugere dermatoscopia e biópsia |
| 7   | 💬 "Estou com febre, 38,2"                              | Rotina: alerta de febre; Home muda o resumo                           | Temperatura **38,2 °C** + alerta de neutropenia febril                                              |
| 8   | 💬 "Dormi mal, umas 4 horas"                            | Rotina → Sono 4h                                                      | —                                                                                                   |
| 9   | 💬 "Tô meio triste hoje, com medo da próxima quimio"    | Perfil → **Meu Diário** ganha a entrada                               | Fator "humor baixo" no risco                                                                        |

No 📎 também há **📑 Laudo ou exame (do computador)…**: aceita foto ou PDF e o "OCR" reconhece o tipo
pelo nome do arquivo (_tomografia_, _ressonância_, _eco_, _receita_, _biópsia_; senão, hemograma).

### Conversas da IA clínica já prontas no painel

Na lateral, embaixo de **Rosa Maria Andrade**: _Briefing para a consulta de quinta_, _Conduta na
neutropenia do D8_, _Dor torácica em uso de doxorrubicina_ e _Síndrome mão-pé com capecitabina_.
Em **Recentes**: _Evidência do monitoramento por PRO_ (Basch et al.). Cada resposta tem
**Raciocínio Clínico** e **Fontes e Referências** (contexto Anicca + PubMed).

Perguntas que geram respostas novas: _"Conduta para a febre?"_, _"E a dor no peito?"_,
_"E a pinta?"_, _"E a foto do braço?"_, _"Síndrome mão-pé?"_, ou qualquer outra (vem um resumo da paciente).

> As referências do PubMed são artigos reais (diretrizes ASCO/IDSA, ESMO, ESC, EORTC; ensaios CREATE-X e Basch),
> mas a busca é **simulada** na demo — não há chamada ao PubMed sem internet.

## Agenda e Alertas no painel

Na lateral do painel, **Agenda** e **Alertas** (o número vermelho conta alertas novos críticos/altos).
O _Painel Geral_ usa os mesmos dados: "Agenda Hoje", "Fila de Atendimento" e "Alertas Clínicos".

- **Agenda:** faixa com os próximos 7 dias + "Próximos". Cada consulta tem tipo, status e se a
  paciente confirmou pelo WhatsApp. Ações: Confirmar, Realizado, Faltou, Remarcar, Cancelar, Reabrir,
  Excluir, e **+ Novo agendamento**.
- **Alertas:** triagem por gravidade (Crítico/Alto/Médio/Baixo, que também filtram). Os alertas nascem
  do que a Rosa relata (febre, Body Map, CTCAE, humor, remédios atrasados) + alertas dos outros
  pacientes. Ações: Em análise, **Resolver** (com a conduta), Reabrir, Abrir prontuário.

**Roteiro extra — painel → WhatsApp → painel (≈ 1 min):**

1. **Painel:** Agenda → **+ Novo agendamento** → paciente **Rosa**, escolha dia e hora → Agendar.
2. **WhatsApp:** a Ani manda na hora _"A Dra. Sandra Motta agendou…"_ pedindo **CONFIRMO** ou **REMARCAR**.
3. **WhatsApp:** responda _"Confirmo"_ → no painel o card vira **Confirmado · via WhatsApp**.
   Remarcar ou cancelar no painel também avisa a Rosa; _"Preciso remarcar"_ anota o pedido na consulta.
4. **Alertas ao vivo:** mande _"Estou com febre, 38,2"_ → aparece um alerta **Crítico · NOVO** no topo
   e o contador da lateral sobe. Clique em **Resolver**, escreva a conduta e confirme.

| No painel  | Ações                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| Agenda     | criar, confirmar, marcar realizado/falta, remarcar, cancelar, reabrir, excluir |
| Alertas    | em análise, resolver com conduta, reabrir                                      |
| IA clínica | nova conversa, continuar conversa, ver fontes                                  |

## O que dá para criar, editar e excluir no app

| Tela                       | Onde fica                                             | Ações                                                                   |
| -------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Rotina                     | aba Rotina                                            | remédios, temperatura, água, sono                                       |
| Body Map                   | Rotina → Body Map                                     | registrar (com foto), ver detalhe, editar grau/tipo/observação, excluir |
| Escala CTCAE               | Body Map → "Prefere responder por sintoma?" ou Perfil | registrar 7 sintomas, histórico, excluir                                |
| Documentos                 | aba Docs → +                                          | enviar foto ou PDF, ver, excluir                                        |
| Chamados                   | Home → Chamados ou Perfil                             | abrir, editar, mudar status (andamento/resolvido/reabrir), excluir      |
| Meu Diário                 | Perfil → Meu Acompanhamento                           | check-in de humor, editar, excluir                                      |
| Cuidadores / Equipe médica | Perfil → Rede de Apoio                                | vincular, desvincular                                                   |
| Smartwatch                 | Perfil → Configurações → Dispositivos                 | sincronizar                                                             |
| Ani                        | aba Ani                                               | conversar (mesma memória do WhatsApp)                                   |

## Plano B — app no celular de verdade

Funciona sem internet se celular e notebook estiverem na **mesma rede local**:

1. Ligue o **roteador do celular com os dados móveis desligados** (ou um roteador de viagem) e conecte o notebook nele.
2. O servidor de demo mostra o IP ao iniciar (`Na rede local: http://192.168.x.x:8000`).
3. Inicie o app apontando para esse IP (PowerShell):

   ```bash
   cd apps/mobile; $env:EXPO_PUBLIC_API_URL="http://192.168.x.x:8000/api/v1"; npx expo start --offline --lan --clear
   ```

4. Abra no celular pelo app de desenvolvimento (development build). O Expo Go pode não ter módulos
   nativos usados pelo projeto (Google Sign-In, Health Connect) — **teste antes**. Se der problema, fique no Plano A.
5. No celular o app sincroniza a cada 3 s (o React Native não tem SSE).

## Se algo der errado

| Sintoma                                    | Solução                                                                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| "A porta 8000 já está em uso"              | A API FastAPI está rodando. Pare ela (Ctrl+C) e rode o servidor de demo de novo.                                        |
| Login dá **401** e o WhatsApp não responde | Quem está na 8000 é a API real, não o servidor de demo. Mesma solução acima.                                            |
| Simulador sem foto da Ani / logo quebrado  | Você abriu o arquivo `whatsapp.html` direto. Use **http://localhost:8000/whatsapp**.                                    |
| App mostra outra paciente / dados antigos  | Saia (Perfil → Configurações → Sair) e entre com `rosa@anicca.demo`.                                                    |
| App não muda sozinho                       | Deixe a janela do app visível (janela, não aba). Ao voltar para ela, ele sincroniza. Em último caso, F5.                |
| Painel não muda                            | Confirme que o terminal 1 está rodando: o painel volta a atualizar sozinho quando o servidor volta. Em último caso, F5. |
| Expo pede login / checa versões            | Use `--offline`.                                                                                                        |
| Aviso de fonte do Google no Next           | Normal offline: ele usa a fonte reserva.                                                                                |
| Quero recomeçar                            | **↺ Reiniciar** no simulador, ou Ctrl+C e `node scripts/demo/server.mjs` de novo.                                       |

## Personas (fictícias)

- **Rosa Maria Andrade**, 52 anos, Osasco–SP, SUS. Carcinoma ductal invasivo de mama RH+/HER2−,
  estádio IIB, protocolo AC-T, **ciclo 2/6, dia 8**. Neutrófilos 1.200/mm³ ontem (nadir esperado).
  Diagnóstico há 83 dias, tratamento iniciado no dia 42 (dentro do prazo da Lei dos 60 dias).
- **Lucas Andrade**, filho e cuidador.
- **Dra. Sandra Motta**, Oncologia Clínica — consulta daqui a 6 dias.
- Painel: mais 5 pacientes (colo do útero, cólon, pulmão, próstata, linfoma) com riscos diferentes.

As datas são relativas ao dia de hoje, então a demo sempre parece "atual".

Onde editar:

- Textos e datas do app: `apps/mobile/src/shared/mocks/demo-data.ts`
- Rotina, Body Map, documentos, chamados, diário, CTCAE, respostas da Ani, nota clínica, conversas e fontes do painel, agenda e alertas: `scripts/demo/server.mjs`
- Página do simulador: `scripts/demo/whatsapp.html`
- Foto do exemplo "pinta na pele": `scripts/demo/assets/lesao-pele.webp` (troque o arquivo mantendo o nome)
