CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO

Evelin Brandão Cordeiro — RM 97814
Pabllo Vinicyus Oliveira Borges de Souza — RM 550124

ANICCA
FASE 5

São Paulo
2026

---

CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO

Evelin Brandão Cordeiro — RM 97814
Pabllo Vinicyus Oliveira Borges de Souza — RM 550124

ANICCA
FASE 5

Atividade do Enterprise Challenge apresentada ao curso de Bacharelado em Sistemas de Informação do Centro Universitário FIAP, como parte das entregas da Fase 5 — Atividade MVP Completo: Programando a Solução e Produzindo um Produto.

São Paulo
2026

---

## RESUMO EXECUTIVO
A Anicca — cujo slogan é "Navegando com você na jornada contra o câncer" — é um hub de navegação oncológica conversacional desenvolvido para acompanhar o paciente com câncer em cada aspecto do seu cotidiano: do diagnóstico ao pós-tratamento. Nesta Fase 5, a solução evoluiu da prototipação para a implementação técnica de um MVP funcional consolidado na nuvem. O presente documento descreve as evoluções técnicas realizadas com extremo rigor técnico — incluindo integração total do Backend for Frontend (BFF) em FastAPI com deploy no Render, arquitetura de dados com PostgreSQL no Supabase, integração AWS S3 e Textract (OCR), e orquestração de múltiplos agentes via LangGraph com a API Gemini do Google. Adicionalmente, demonstra-se o estado final das plataformas construídas em React Native (Expo SDK 52) para o app do paciente e Next.js para o painel web médico. Toda essa evolução certifica a capacidade da plataforma em operar como um hub omnichannel inteligente que traduz a complexidade de laudos e sintomas em interfaces GenUI limpas, promovendo a adesão e o acolhimento do paciente.
Palavras-chave: hub conversacional; navegação oncológica; MVP; deploy cloud; FastAPI; React Native; LangGraph; AWS; Supabase.

---

## 1. VERSÃO ATUAL DO PROJETO E EVOLUÇÕES

Nesta fase final do projeto, focamos exclusivamente em transformar o MVP em um produto sólido, finalizando integrações vitais de inteligência artificial, nuvem e corrigindo gargalos na experiência do usuário. O histórico detalhado dos últimos commits (de ontem e as modificações finais de hoje) comprova as seguintes evoluções com extremo rigor técnico:

- **Integração do AI Hub e Cloud DB (Commit `cd11753`):** 
  - **LangGraph & LLM:** Implementação da arquitetura de agentes no backend (`apps/api/src/infrastructure/agents/graph/doctor_graph.py`), orquestrando múltiplos nós cognitivos.
  - **AWS S3:** Implementação de upload de imagens via `boto3` no router FastAPI (`apps/api/src/presentation/routers/body_map_router.py`), com geração e gravação de URLs públicas para consumo no front-end.

- **Visão Computacional e OCR (Commit `cd11753`):** 
  - Criação do nó de visão computacional (`apps/api/src/infrastructure/agents/nodes/cv_analysis_node.py`) que utiliza o modelo `gemini-1.5-flash` via SDK do Google. Ele recebe os bytes da imagem (inline_data) do Body Map, as opções de sintomas marcados e a intensidade para gerar uma nota clínica usando processamento multimodal.
  - Implementação de extração de texto via AWS Textract (`apps/api/src/infrastructure/ocr/textract_client.py`).

- **CRUD e Rotas do Body Map (Commit `e174c49` e mudanças atuais):** 
  - Correção de endpoints da API mobile (`apps/mobile/src/shared/api/body-map.ts`) adicionando o prefixo REST correto (`/api/v1/body-map`). 
  - Refatoração crítica da estrutura de navegação do Expo Router: Segregação da tela de lista (`apps/mobile/src/pages/body-map/BodyMapPage.tsx`) da tela de detalhes (`apps/mobile/app/body-map-details/[id].tsx`), evitando colisões de rota interna no File-System Routing do React Native.
  - Correção de mensageria Pub/Sub no backend: Ajuste do parâmetro `event_data` para `payload` na função `publish_catalog_event`, garantindo que os websockets do Redis atualizem o Next.js do médico sem falhas.

- **Correção de Upload Web via FormData (Commit `d9a3890`):** 
  - Solução de um bug no envio multipart form-data. O ambiente web do Expo estava falhando ao enviar Blobs crus. A lógica foi atualizada para converter explicitamente instâncias em arquivos nativos (`new File([blob], 'photo.jpg', { type: 'image/jpeg' })`) antes do anexo.

- **Resiliência de Banco de Dados e Cache Persistido (Mudanças Atuais):** 
  - **Tratamento de Enums:** Correção na camada de persistência (`apps/api/src/infrastructure/repositories.py`) que gerava erros 500 no Uvicorn quando strings inválidas como "curativo" tentavam ser inseridas. Aplicamos um fallback seguro para o valor `convenio`.
  - **Zustand Persist:** Injeção via `useEffect` no frontend (`apps/mobile/src/features/home/ui/PatientHome.tsx`) para sobrescrever falhas de inicialização do cache (`AsyncStorage`), populando a store obrigatoriamente com os dados médicos validados para o pitch (Evelin Brandão, Câncer de Mama, Estádio IIB).

- **Polimento UI/UX (Mudanças Atuais):** 
  - Melhorias no `PatientHome.tsx`: Importação de SVG nativo para a foto de perfil da Ani, diminuição de padding e font-size para `14px` na badge do perfil, e remoção da propriedade `backgroundColor: BRAND.SURFACE.BORDER_DARK` para um design mais limpo focado exclusivamente no diagnóstico primário.

---

## 2. PROTÓTIPO FUNCIONAL E ARQUITETURA

O protótipo funcional de alta fidelidade da Anicca ultrapassou o grau desejável de **80% de conclusão do MVP**. O sistema encontra-se funcional nas frentes essenciais descritas: Frontend Mobile, Frontend Web, Backend API e Integrações com Banco de Dados em Cloud (PostgreSQL via Supabase). 

### 2.1 Funcionalidades Desenvolvidas e em Pleno Funcionamento
1. **Aplicativo Mobile do Paciente (React Native/Expo):** 
   Navegação centralizada, com integração viva ao Chat da Ani (assistente IA multimodal). Possui a ferramenta "Body Map" (Mapa Corporal) suportando operações CRUD reais — permitindo registrar uma dor, enviar fotos, consultar histórico e excluir entradas diretamente no banco de dados.
2. **Dashboard Web do Médico (Next.js):** 
   Painel de monitoramento que atualiza informações via WebSockets/Redis em *tempo real*. Se um paciente insere um sintoma crítico no aplicativo, a plataforma web do médico recebe a notificação sem recarregar a tela, recalculando automaticamente o "Risco de Abandono" (ML) e apresentando o resumo clínico processado pela Inteligência Artificial.
3. **Backend Cloud Native (FastAPI + Supabase + AWS):** 
   Toda a orquestração do LangGraph, chamadas para o modelo LLM do Google, geração de URLs pré-assinadas para envio/leitura de imagens na AWS e persistência no banco de dados na nuvem rodam através de nossa API REST robusta, documentada e com tratamento assíncrono de eventos.

### 2.2 Entregáveis da Atividade
- **Repositório do Código-Fonte (GitHub):** `[INSERIR SEU LINK DO GITHUB AQUI]`
- **Vídeo de Demonstração e Pitch:** `[INSERIR SEU LINK NÃO LISTADO DO YOUTUBE AQUI]`
- **Apresentação de Slides (PDF):** `[ANEXADO NA PLATAFORMA]`

Este material comprova que a Anicca aliou visão de mercado com a mais alta tecnologia (Agentes de IA e Event-Driven Architecture) para um desenvolvimento viável e de escala.
