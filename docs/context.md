

CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO





Evelin Brandão Cordeiro — RM 97814
Pabllo Vinicyus Oliveira Borges de Souza — RM 550124




ANICCA
ENTERPRISE CHALLENGE — CLARO — FASE 4







São Paulo
2026


CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO




ANICCA
ENTERPRISE CHALLENGE — CLARO — FASE 4


Atividade do Enterprise Challenge apresentada ao curso de Bacharelado em Sistemas de Informação do Centro Universitário FIAP, como parte das entregas da Fase 4 — Enterprise Challenge Claro.







São Paulo
2026

RESUMO EXECUTIVO

A Anicca — cujo slogan é "Navegando com você na jornada contra o câncer" — é um hub de navegação oncológica conversacional desenvolvido para acompanhar o paciente com câncer em cada aspecto do seu cotidiano: do diagnóstico ao pós-tratamento. Desenvolvida com o paciente SUS em mente, a plataforma é aberta a qualquer pessoa em tratamento oncológico, independentemente da modalidade (SUS, convênio ou particular). A solução integra WhatsApp, web e app em um único hub conversacional com memória de contexto persistente, operado por Ani, um mascote gato personalizável que acompanha pacientes, cuidadores e médicos. A plataforma possui três perfis distintos: paciente, cuidador e médico — este último com painel clínico de decisão apoiado por IA, incluindo comparação com casos similares em bases nacionais e internacionais (guidelines ASCO, SBOC, NCCN, PubMed e OncoKB) por meio de arquitetura de múltiplos agentes de inteligência artificial. A Anicca também incorpora Body Map interativo para registro de sintomas por região corporal, módulo completo de rotina diária (medicamentos, hidratação, temperatura, sono), journaling emocional contextual gerado pelo LLM com base no estado clínico e emocional do paciente, integração com smartwatches, grafo de conhecimento oncológico (Neo4j) para raciocínio relacional clínico avançado, e Federated Learning para treino de modelos de ML em dados hospitalares sem centralização — atendendo à LGPD por design. O tratamento de dados segue rigorosamente a LGPD, com consentimento explícito, pseudonimização e criptografia.

Palavras-chave: câncer; navegação oncológica; hub conversacional; SUS; WhatsApp; inteligência artificial; multi-agentes; federated learning; Body Map; LGPD; Ani.

LISTA DE FIGURAS

Figura 1 — Arquitetura geral do hub conversacional Anicca (BFF + três perfis + multi-agentes)
Figura 2 — Jornada do usuário: paciente oncológica Rosa Silva
Figura 3 — Wireframe: fluxo de onboarding guiado pelo Ani (7 etapas)
Figura 4 — Wireframe: tela de cadastro (opcional)
Figura 5 — Wireframe: Hub principal com Generative UI e Body Map
Figura 6 — Wireframe: Body Map interativo (visão paciente e visão médico)
Figura 7 — Wireframe: módulo de Rotina de Hoje
Figura 8 — Wireframe: módulo de Chamados e Ouvidoria
Figura 9 — Wireframe: Meus Documentos com catalogação por IA
Figura 10 — Wireframe: personalização do avatar
Figura 11 — Wireframe: painel do médico com IA clínica e multi-agentes
Figura 12 — Wireframe: módulo de journaling emocional contextual
Figura 13 — Diagrama da arquitetura de agentes especializados (LangGraph)
Figura 14 — Diagrama do Knowledge Graph oncológico (Neo4j)
Figura 15 — Diagrama do Federated Learning com hospitais parceiros

LISTA DE QUADROS

Quadro 1 — Mapeamento exaustivo de funcionalidades da Anicca por necessidade e perfil
Quadro 2 — Análise comparativa de concorrentes
Quadro 3 — Personas da Anicca
Quadro 4 — Stack tecnológico do hub conversacional
Quadro 5 — Cronograma de desenvolvimento
Quadro 6 — Mapeamento de canais e funcionalidades por interface
Quadro 7 — Padrões de arquitetura e boas práticas adotadas
Quadro 8 — Protocolo LGPD e tratamento de dados sensíveis
Quadro 9 — Fontes de dados do painel clínico do médico
Quadro 10 — Arquitetura de agentes especializados da Anicca por perfil
Quadro 11 — Síntese de tecnologias emergentes: maturidade, viabilidade e fase
Quadro 12 — Dados de smartwatch clinicamente relevantes para pacientes oncológicos

LISTA DE ABREVIATURAS E SIGLAS

ABNT— Associação Brasileira de Normas Técnicas
AI/IA— Inteligência Artificial
ANVISA— Agência Nacional de Vigilância Sanitária
API— Application Programming Interface
ASCO— American Society of Clinical Oncology
AWS— Amazon Web Services
BFF— Backend for Frontend
CACON— Centro de Alta Complexidade em Oncologia
CFM— Conselho Federal de Medicina
CNES— Cadastro Nacional de Estabelecimentos de Saúde
CTCAE— Common Terminology Criteria for Adverse Events
DPO— Data Protection Officer — Encarregado de Proteção de Dados
FHIR— Fast Healthcare Interoperability Resources
FL— Federated Learning — Aprendizado Federado
GenUI— Generative User Interface
HRV— Heart Rate Variability — Variabilidade da Frequência Cardíaca
INCA— Instituto Nacional de Câncer
KG— Knowledge Graph — Grafo de Conhecimento
LLM— Large Language Model — Modelo de Linguagem de Grande Escala
LGPD— Lei Geral de Proteção de Dados Pessoais
MAS— Multi-Agent System — Sistema de Múltiplos Agentes
ML— Machine Learning — Aprendizado de Máquina
MVP— Minimum Viable Product — Produto Mínimo Viável
NCCN— National Comprehensive Cancer Network
OCR— Optical Character Recognition — Reconhecimento Óptico de Caracteres
PRO— Patient-Reported Outcome — Desfecho Relatado pelo Paciente
RAG— Retrieval-Augmented Generation
RNDS— Rede Nacional de Dados em Saúde
SaMD— Software as a Medical Device
SBOC— Sociedade Brasileira de Oncologia Clínica
SUS— Sistema Único de Saúde
TFD— Tratamento Fora de Domicílio
UNACON— Unidade de Assistência de Alta Complexidade em Oncologia
WCAG— Web Content Accessibility Guidelines

SUMÁRIO

1 CONTEXTUALIZAÇÃO DO PROJETO
1.1 PROBLEMA IDENTIFICADO
1.2 SOLUÇÃO PROPOSTA — ANICCA
1.3 PÚBLICO-ALVO E MODALIDADES DE ACESSO
1.4 DIFERENCIAIS DE MERCADO
2 HUB: CONVERGÊNCIA DE INTERFACES CONVERSACIONAIS
2.1 ORIENTAÇÕES DA MENTORIA CLARO (14/05/2026)
2.2 ARQUITETURA DO HUB — BFF E TRÊS PERFIS
2.3 CANAIS, FLUXOS E INTEGRAÇÃO
2.4 GENERATIVE UI, MASCOTE ANI E NAVEGAÇÃO DUAL
2.5 PLANEJAMENTO DE EVOLUÇÕES DO HUB
3 MATERIAIS E MÉTODOS
3.1 STACK TECNOLÓGICO GERAL
3.2 ARQUITETURA DE SOFTWARE — CLEAN ARCHITECTURE E BFF
3.3 TECNOLOGIAS DO HUB CONVERSACIONAL
3.4 LGPD — PROTEÇÃO DE DADOS SENSÍVEIS EM SAÚDE
3.5 INTEGRAÇÕES E APIS
3.6 TECNOLOGIAS EMERGENTES E DIFERENCIAIS TÉCNICOS AVANÇADOS
3.6.1 Orquestração de Múltiplos Agentes de IA
3.6.2 Grafo de Conhecimento Oncológico
3.6.3 Aprendizado Federado com Privacidade por Design
3.6.4 Integração com Wearables — Google Health Connect
3.6.5 Síntese — Maturidade, Viabilidade e Posicionamento
4 PLANEJAMENTO DO PROJETO E CRONOGRAMA
5 DESENVOLVIMENTO DO PROJETO
5.1 MAPEAMENTO EXAUSTIVO DE FUNCIONALIDADES
5.2 ONBOARDING DETALHADO E TELA DE CADASTRO
5.3 WIREFRAMES DAS TELAS PRINCIPAIS
5.4 JORNADA DO USUÁRIO
5.5 PERSONAS
5.6 ANÁLISE DE CONCORRENTES
5.7 IMPLEMENTAÇÃO TÉCNICA — CÓDIGO FRONTEND
REFERÊNCIAS


1 CONTEXTUALIZAÇÃO DO PROJETO
1.1 PROBLEMA IDENTIFICADO
O Brasil enfrenta uma crise silenciosa na assistência oncológica. O INCA estima 704 mil casos novos por ano no triênio 2023–2025, sendo os mais incidentes: mama feminina (73 mil), próstata (71 mil), cólon e reto (45 mil), pulmão (32 mil) e colo do útero (17 mil) (INCA, 2023). Ainda que a Lei n.º 12.732/2012 garanta início de tratamento em até 60 dias após o diagnóstico patológico, 73,6% dos pacientes nos dez tipos tumorais com piores indicadores têm essa lei descumprida (Radar do Câncer, 2021–2025). Em estados do Norte e Nordeste, a espera pode ultrapassar 634 dias (Oncoguia, 2025). Além disso, 68% dos pacientes desconhecem seus direitos legais e 44% não conseguem acessá-los (Oncoguia, 2026).

O problema se desdobra em múltiplas dimensões do cotidiano: desinformação sobre diagnóstico e tratamento; isolamento emocional e social; dificuldade de gestão da rotina diária (medicamentos, sintomas, hidratação, sono); dificuldades financeiras; logística de deslocamento; burocracia do SISREG, APAC e TFD; e ausência de um canal único que acompanhe o paciente de forma contínua. Pesquisa primária no Reclame Aqui (INCA, Hospital de Amor, A.C.Camargo, IBCC, Oncoclínicas) confirma que as quatro maiores fontes de frustração são: agendamento sem retorno, atraso de laudo, comunicação contraditória entre clínica e convênio, e falha de autorização de tratamento. Nenhuma solução digital disponível no Brasil endereça esse conjunto de necessidades de forma integrada.
1.2 SOLUÇÃO PROPOSTA — ANICCA
A Anicca é um hub de navegação oncológica conversacional que integra WhatsApp, web e app  em uma experiência unificada, contínua e inteligente. A plataforma opera por meio de Ani, um mascote gato personalizável que guia pacientes, cuidadores e médicos. O agente de IA subjacente é baseado em LLM com RAG oncológico, sem emitir diagnóstico ou prescrição — posicionando a Anicca fora do escopo regulatório de SaMD da ANVISA (RDC 657/2022). No nível técnico avançado, o Ani opera sobre uma arquitetura de múltiplos agentes especializados (Multi-Agent System via LangGraph), um grafo de conhecimento oncológico (Neo4j + OncoKB) e modelos preditivos treinados com Federated Learning — garantindo profundidade de raciocínio clínico e conformidade LGPD por design.

A integração com a RNDS permite importar o histórico clínico disponível no Meu SUS Digital para popular o perfil de jornada. Os dados gerados pelo uso da Anicca podem ser compartilhados de forma anonimizada com pesquisadores parceiros mediante consentimento explícito — esses dados são distintos dos dados clínicos da RNDS e têm base legal na LGPD (art. 11, II, c). O audit trail de consentimento é registrado em blockchain privado (Hyperledger Fabric ou Polygon PoS), garantindo prova criptograficamente verificável para eventual auditoria da ANPD.
1.3 PÚBLICO-ALVO E MODALIDADES DE ACESSO
A Anicca foi desenvolvida com o paciente SUS em mente, mas é aberta a qualquer pessoa em tratamento oncológico, adaptando conteúdos, fluxos e canais de encaminhamento conforme a modalidade registrada: SUS (CACONs, UNACONs, TFD, ouvidorias municipais), convênio (ANS, rede credenciada) ou particular (orientações diretas e PROCON em caso de litígio). O público primário são pacientes oncológicos; o secundário, cuidadores familiares; o terciário, oncologistas e equipes de enfermagem que acessam o painel médico.
1.4 DIFERENCIAIS DE MERCADO
A Anicca se diferencia das soluções existentes no Brasil e no mundo em oito dimensões: (a) WhatsApp como canal primário, eliminando fricção de download; (b) cobertura da jornada completa, integrando rotina diária, direitos, logística, suporte emocional e pesquisa num único hub; (c) mascote personalizável Ani que cria vínculo afetivo; (d) três perfis distintos (paciente, cuidador, médico) na mesma interface; (e) Body Map interativo para registro e visualização de sintomas por região corporal; (f) painel médico com arquitetura multi-agente para raciocínio clínico avançado sobre guidelines e literatura; (g) Knowledge Graph oncológico próprio para raciocínio relacional que nenhum concorrente global possui; (h) Federated Learning para modelos ML treinados com dados de hospitais parceiros sem centralização — inédito no mercado healthtech oncológico brasileiro.

2 HUB: CONVERGÊNCIA DE INTERFACES CONVERSACIONAIS
2.1 ARQUITETURA DO HUB — BFF E TRÊS PERFIS
O hub adota o padrão arquitetural BFF (Backend for Frontend) — o backend FastAPI é um intermediário dedicado ao frontend que adapta as respostas para cada canal e perfil. O BFF recebe mensagens de qualquer canal via Gateway de Canal unificado, aciona o agente coordenador Ani (LangGraph), que distribui subtarefas para agentes especializados e retorna a resposta formatada: template rich para WhatsApp, card JSON declarativo para app/web (GenUI), texto para voz. A camada de contexto unificado (Redis) persiste estado da conversa, perfil e histórico independentemente do canal.

Os três perfis da plataforma — Paciente, Cuidador e Médico — acessam a mesma interface (app/web) com conteúdo adaptado pelo perfil declarado no onboarding. Não há portais separados: o mesmo código serve todos os perfis.
Figura 1 — Arquitetura geral do hub conversacional Anicca (BFF + três perfis + multi-agentes)
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
2.2 CANAIS, FLUXOS E INTEGRAÇÃO
O app móvel e o portal web são a mesma interface, diferenciada pelo perfil de acesso. O WhatsApp é o canal prioritário para o MVP, integrado via Whatsmiau Cloud. O canal de voz (Twilio Voice) é previsto para evolução. A plataforma adapta automaticamente os canais de encaminhamento conforme a modalidade de saúde do usuário.

Quadro 6 — Mapeamento de canais e funcionalidades por interface
Canal
Perfil Principal
Funcionalidades
Tecnologia
WhatsApp
Paciente (qualquer modalidade)
RAG, OCR laudo, Body Map básico, chamados, lembretes, sintomas, notificações, journaling check-in
Whatsmiau Cloud  + LangGraph
App Móvel
Paciente + Cuidador + Médico
Todas + Body Map visual, dashboard GenUI, smartwatch, painel médico, avatar, journaling completo
React Native / Expo SDK 52
Web
Paciente + Cuidador + Médico
Mesma interface do app adaptada ao perfil e dispositivo
Next.js 14 (App Router)
Voz (roadmap)
Paciente sem smartphone
RAG informacional, lembretes, chamados básicos
Twilio Voice + Amazon Polly TTS
RNDS
Paciente (importação)
Importação histórico do Meu SUS Digital para o perfil de jornada
FHIR R4 / Meu SUS Digital

Fonte: Elaborado pelos autores (2026)
2.4 GENERATIVE UI, MASCOTE ANI E NAVEGAÇÃO DUAL
A Anicca adota Generative UI (GenUI) em três camadas: (a) estática — componentes fixos (header, navegação) que garantem previsibilidade; (b) declarativa — o agente Ani retorna JSON estruturado que o frontend renderiza como cards CTCAE, timelines, Body Maps; (c) conversacional pura — respostas em texto/áudio para perguntas abertas. O protocolo A2UI do Google (dez/2025) valida o paradigma declarativo. O princípio de navegação dual é central: alternância a qualquer momento entre modo guiado pelo Ani e modo autônomo, com botão persistente em todas as telas. O mascote Ani é personalizável em aparência, nome e tom de comunicação, com avatar do usuário configurável representando a diversidade do paciente oncológico brasileiro.
2.5 PLANEJAMENTO DE EVOLUÇÕES DO HUB
As evoluções planejadas incluem: integração direta ao barramento RNDS via hospital parceiro; canal de voz para pacientes sem smartphone; painel pós-tratamento com suporte psicossocial; Ani pediátrico para crianças com câncer; integração com prontuários eletrônicos (OpenEHR/HL7 FHIR); e expansão do Knowledge Graph com dados de jornada proprietários.

3 MATERIAIS E MÉTODOS
3.1 STACK TECNOLÓGICO GERAL
A escolha tecnológica prioriza: viabilidade para equipe de dois desenvolvedores full stack em um semestre; custo operacional baixo no MVP; e escalabilidade sem reestruturação arquitetural.

Quadro 4 — Stack tecnológico da Anicca
Camada
Tecnologia
Justificativa
Frontend Mobile
React Native (Expo SDK 52)
Multiplataforma iOS/Android; New Architecture (Fabric+JSI); Expo Router v4 file-based
Frontend Web
Next.js 14 (App Router)
RSC para SSR; Server Actions; streaming de respostas LLM
UI Components
NativeWind v4 + shadcn/ui
Tailwind CSS unificado mobile/web; WCAG 2.1 AA built-in
Estado Servidor
React Query v5 (TanStack)
Cache automático; refetch; loading/error padronizados
Estado Global
Zustand
Store leve; perfil, mascote, preferências, sessão
Formulários
React Hook Form + Zod
Validação declarativa; performance superior ao Formik
Backend API / BFF
Python 3.12 / FastAPI
Async nativo; Pydantic v2; ecossistema ML; BFF por canal e perfil
Orquestração de Agentes
LangGraph (LangChain v1.0)
Grafo de estados para multi-agent com auditabilidade e controle de fluxo
LLM / IA
Claude Sonnet 4.5 (Anthropic)
Suporte nativo a pt-BR; baixa alucinação; streaming; 200k tokens
RAG / Vector DB
LangChain + pgvector (PostgreSQL)
pgvector no MVP; embeddings text-embedding-3-small
Knowledge Graph
Neo4j Community + GraphQL
Grafo oncológico: entidades clínicas, protocolos, variantes, efeitos colaterais
Ferramentas do Médico
PubMed API, OncoKB REST, ASCO/NCCN RAG, ClinicalTrials.gov API
Busca em tempo real para suporte de decisão clínica baseado em evidências
OCR Laudos
AWS Textract
Precisão para docs médicos em PDF/JPG; extração estruturada
Body Map
SVG interativo + React Native Gesture Handler
Mapa corporal tocável com histórico temporal; sincronização com CTCAE
ML Abandono
XGBoost + SHAP (scikit-learn)
Robustez em datasets tabulares; SHAP para interpretabilidade
Federated Learning
PySyft (OpenMined) / TF Federated
FL com parceiros hospitalares; treino local sem centralizar prontuários; LGPD by design
Blockchain (consentimento)
Hyperledger Fabric ou Polygon PoS
Audit trail imutável de consentimento LGPD; prova criptograficamente verificável para ANPD
Banco de Dados
PostgreSQL 16 (AWS RDS)
Relacional + pgvector; pgcrypto para dados sensíveis
Cache / Sessão
Redis 7 (AWS ElastiCache)
Contexto conversacional entre turnos e canais
Wearables
Google Health Connect (Android)
Agrega Samsung Health, Amazfit/Zepp, Garmin, Wear OS; único SDK após depreciação Samsung SDK (jul/2025)
WhatsApp
Whatsmiau Cloud
Gratuita até 1.000 conversas/mês; webhooks; templates pt-BR
Cloud
AWS São Paulo (sa-east-1)
Residência de dados no Brasil (LGPD); parceiro Claro/Embratel
CI/CD
GitHub Actions + Docker
Pipelines automatizados de teste, lint e deploy
Testes
Jest + RNTL + Pytest + Playwright
Unitários, integração e E2E; cobertura mínima 70%
Monitoramento
Sentry + OpenTelemetry + Grafana
Rastreabilidade sem PII; alertas proativos

Fonte: Elaborado pelos autores (2026)
3.2 ARQUITETURA DE SOFTWARE — CLEAN ARCHITECTURE E BFF
3.2.1 Padrão BFF (Backend for Frontend)
O FastAPI atua como BFF — backend intermediário dedicado ao frontend. Cada canal recebe respostas formatadas especificamente para suas capacidades: WhatsApp recebe templates ricos; app/web recebe JSON declarativo que a GenUI renderiza; voz recebe texto simples para síntese TTS. O BFF também gerencia autenticação, rate limiting por canal e log de auditoria sem PII.

3.2.2 Clean Architecture — Quatro Camadas
(a) Domain Layer: entidades puras (Paciente, Jornada, Sintoma, BodyMapEntry, Chamado, Medicamento, EntradaJournaling, EntradaClínica); (b) Application Layer: use cases que orquestram entidades (ProcessarLaudoUseCase, RegistrarSintomaUseCase, AbrirChamadoUseCase, GerarJournalingContextualUseCase, ConsultarGuidelinesMultiAgenteUseCase); (c) Infrastructure Layer: implementações concretas (PostgresRepositório, RedisCache, AnthropicLLM, AWSTextractOCR, WhatsmiauCloudGateway, PubMedTool, OncoKBTool, Neo4jKGClient); (d) Presentation Layer: controllers FastAPI + componentes React Native/Next.js.

3.2.3 Feature-First no Frontend e Qualidade de Código
Organização Feature-First: src/features/[nome]/{components,hooks,services,store,types,index.ts}. TypeScript estrito em todo o projeto. Componentes exclusivamente funcionais com hooks. ESLint (airbnb-typescript) + Prettier + Husky. Conventional Commits. React Native New Architecture (Fabric+JSI). FlashList para listas longas. WCAG 2.1 AA em todas as telas.

Quadro 7 — Padrões de arquitetura e boas práticas adotadas
Categoria
Padrão / Ferramenta
Benefício
Arquitetura
Clean Architecture (4 camadas)
Isolamento; testabilidade; portabilidade
Padrão Backend
BFF (Backend for Frontend)
Respostas por canal e perfil; sem acoplamento entre interfaces
Orquestração IA
LangGraph (multi-agent)
Estado durável; auditabilidade; agentes paralelos especializados
Raciocínio Clínico
Knowledge Graph Neo4j
Raciocínio relacional; rastreabilidade fonte por nó do grafo
Privacidade ML
Federated Learning (PySyft/TFF)
Treino multicentro sem centralizar dados; LGPD by design
Audit Consentimento
Blockchain Hyperledger/Polygon
Trail criptograficamente verificável para ANPD
Organização Frontend
Feature-First
Escalabilidade; paralelismo; remoção segura de features
Tipagem
TypeScript 5.x strict
Erros em compile-time; refactoring seguro
Estado Servidor
React Query v5
Cache automático; refetch; loading/error padronizados
Estado Global
Zustand
Store leve sem boilerplate
Formulários
React Hook Form + Zod
Validação declarativa; performance
Estilo
NativeWind v4
Design system unificado mobile/web; responsive nativo
Qualidade
ESLint + Prettier + Husky
Consistência automática; pre-commit hooks
Testes
Jest + RNTL + Pytest + Playwright
Unitários, integração e E2E; 70% cobertura
Observabilidade
Sentry + OpenTelemetry + Grafana
Rastreabilidade sem PII; alertas proativos
CI/CD
GitHub Actions + Docker + ECR
Deploy automatizado; rollback seguro

Fonte: Elaborado pelos autores (2026)
3.3 TECNOLOGIAS DO HUB CONVERSACIONAL
O hub opera com arquitetura multi-agente via LangGraph (descrito detalhadamente na seção 3.6.1). A cadeia de processamento base: (1) recebimento da mensagem pelo BFF; (2) recuperação do contexto no Redis; (3) o Ani (orchestrator) decompõe a intenção e distribui subtarefas para agentes especializados em paralelo; (4) agentes retornam resultados ao Ani; (5) Ani sintetiza e formata para o canal de origem; (6) persistência do turno. O corpus RAG inclui portarias do INCA, conteúdo do Oncoguia, legislação oncológica (Leis 12.732/2012, 13.896/2019, 14.450/2022, 14.758/2023, 15.233/2025) e a Política Nacional de Prevenção e Controle do Câncer (Portaria GM/MS 6.590/2025). O módulo ML de risco de abandono usa XGBoost com features clínicas e comportamentais (detalhado na seção 3.6.3).
3.4 LGPD — PROTEÇÃO DE DADOS SENSÍVEIS EM SAÚDE
A RNDS captura dados clínicos do paciente SUS para fins assistenciais, de vigilância e de pesquisa pública (Decreto 12.560/2025). O paciente não "doa" dados da RNDS — ele os importa via Meu SUS Digital para popular seu perfil de jornada na Anicca. O que a Anicca oferece como opt-in separado é o compartilhamento, de forma anonimizada, dos dados de jornada gerados dentro da plataforma (sintomas registrados, tempos entre etapas, adesão ao tratamento) com pesquisadores parceiros. Esses dados são distintos dos dados clínicos da RNDS e têm base legal no art. 11, II, c da LGPD.

Quadro 8 — Protocolo LGPD e tratamento de dados sensíveis
Dimensão
Medida Adotada
Base Legal
Base legal
Consentimento livre, informado e específico para cada finalidade de tratamento
LGPD art. 11, I
Consentimento
Tela dedicada no onboarding em linguagem CEFR A2; revogação nas configurações a qualquer momento
LGPD art. 8.º, §5.º
Audit trail
Blockchain privado (Hyperledger Fabric ou Polygon PoS): cada ação de consentimento (opt-in, opt-out, revogação) registrada como transação imutável com timestamp, hash do termo e ID anônimo
LGPD art. 37 + Resolução ANPD 2/2022
Criptografia em repouso
pgcrypto (PostgreSQL); AES-256 para laudos no S3
LGPD art. 46
Criptografia em trânsito
TLS 1.3 em todas as comunicações
LGPD art. 46
Pseudonimização
CPF, CNS e nome por hash SHA-256 com salt único; IDs anônimos nos logs
LGPD art. 13
Minimização
Apenas dados estritamente necessários para cada funcionalidade
LGPD art. 6.º, III
Logs sem PII
Sentry e OpenTelemetry nunca registram CPF, nome ou diagnóstico
LGPD art. 46
DPO
Encarregado designado antes do go-live; canal de contato público no app
LGPD art. 41
RIPD/DPIA
Relatório de Impacto documentado antes do lançamento
LGPD art. 38
Retenção limitada
Política de retenção por finalidade; exclusão ao fim do período definido
LGPD art. 15
Sub-operadores (LLMs)
Contrato com Anthropic com cláusulas de não-treinamento e não-retenção de dados de pacientes
LGPD art. 39
Protocolo de silêncio
Após 30 dias de inatividade: suspensão de todas as notificações automáticas; retomada apenas por iniciativa do paciente ou ação humana registrada (cuidador/médico)
Ética + LGPD art. 6.º, X
Encerramento por falecimento
Fluxo humano exclusivo: mensagem de condolências ao cuidador vinculado; exclusão dos dados pessoais em até 30 dias conforme solicitação
LGPD art. 18, IV
Pesquisa (dados de jornada)
Opt-in explícito e separado; dados de jornada anonimizados gerados na Anicca — distintos dos dados clínicos da RNDS
LGPD art. 11, II, c
Federated Learning
Treino de modelos ML com dados de hospitais parceiros sem que qualquer prontuário ou dado identificável saia dos servidores de cada instituição
LGPD art. 46 + Decreto 12.560/2025

Fonte: Elaborado pelos autores (2026)

O blockchain para audit trail de consentimento é aplicado de forma cirúrgica — não substitui o banco de dados relacional (PostgreSQL), que continua sendo a fonte de verdade para todos os dados de saúde. O blockchain resolve um problema específico e de alto valor regulatório: provar, de forma tecnicamente incontestável, que o consentimento foi dado, quando foi dado, para qual finalidade e se foi revogado. Em eventual auditoria da ANPD, a Anicca apresenta um trail criptograficamente verificável — sem depender de logs de banco de dados que podem ser alterados por administradores.
3.5 INTEGRAÇÕES E APIS
A RNDS é integrada via importação pelo paciente do Meu SUS Digital (PDF ou JSON FHIR), processado via OCR e parser para popular o perfil de jornada. A integração direta ao barramento RNDS (exigindo CNES e ICP-Brasil) está prevista para a fase de escala via parceria com hospital CACON/UNACON habilitado. A API CNES/DATASUS é utilizada para localização de estabelecimentos por tipo de serviço (tipo 36 = oncologia). O módulo de TFD integra-se às APIs de secretarias municipais parceiras. O painel médico integra PubMed via API NCBI E-utilities, OncoKB via REST API, guidelines ASCO/NCCN/SBOC via RAG especializado e ClinicalTrials.gov via API pública. O módulo de interação medicamentosa consulta o DrugBank (uso de pesquisa) e o Bulário Eletrônico da ANVISA.
3.6 TECNOLOGIAS EMERGENTES E DIFERENCIAIS TÉCNICOS AVANÇADOS
Esta seção descreve quatro tecnologias de fronteira incorporadas à arquitetura da Anicca como diferenciais técnicos estruturais: orquestração de múltiplos agentes de IA (Multi-Agent Orchestration), grafo de conhecimento oncológico (Knowledge Graph), aprendizado federado com privacidade por design (Federated Learning) e integração com wearables via Google Health Connect. As três primeiras são sustentadas por evidências publicadas em periódicos revisados por pares e apresentadas em conferências como ASCO 2025 e Nature Medicine. A quarta responde a uma necessidade clínica documentada com evidência consolidada para os dados de HRV, passos e sono em oncologia.
3.6.1 Orquestração de Múltiplos Agentes de IA (Multi-Agent Orchestration)
3.6.1.1 Fundamentação técnica e evidência clínica
Sistemas de múltiplos agentes de IA (MAS — Multi-Agent Systems) distribuem responsabilidades entre agentes especializados que operam em paralelo, se comunicam e se corrigem mutuamente — reduzindo erros por viés de raciocínio linear e aumentando a cobertura de informações relevantes. A revisão sistemática mais abrangente sobre agentes de IA em medicina clínica, publicada no medrXiv em agosto de 2025 (Wang et al., cobrindo estudos de outubro de 2022 a agosto de 2025), demonstrou que sistemas multi-agente superam LLMs isolados em tarefas clínicas complexas.

Em oncologia, Wang et al. (2025) desenvolveram sistema multi-agente para planejamento de tratamento radioterápico em câncer de pulmão, atingindo +4,75% de melhoria sobre o método padrão ECHO. Ke et al. demonstraram que sistemas multi-agente mitigam vieses de decisão clínica que agentes únicos cometem sistematicamente. No ASCO Annual Meeting 2025, Wang et al. apresentaram um tumor board virtual com múltiplos agentes — cada um com papel específico: busca em literatura, leitura de documentos clínicos, síntese de achados e geração de recomendação (Wang et al., J Clin Oncol, 2025). Em maio de 2025, a Microsoft anunciou o Healthcare Agent Orchestrator no Azure AI Foundry Agent Catalog, validando a maturidade do paradigma multi-agente para aplicação clínica real (Microsoft, 2025).

3.6.1.2 Aplicação na Anicca — arquitetura de agentes especializados
Na Anicca, o Ani é o agente coordenador (orchestrator), responsável por receber a intenção do usuário, decompô-la em subtarefas e distribuí-las para agentes especializados que operam em paralelo via LangGraph. Ao receber uma consulta complexa do médico — por exemplo, "minha paciente tem BRCA2 mutado, estágio III, ciclo 4 de AC-T com fadiga grau 3" — o Ani aciona simultaneamente o Agente Guidelines, o Agente PubMed, o Agente OncoKB e o Agente ClinicalTrials. O resultado é sintetizado com citação de fonte para cada recomendação — rastreável, não genérico.

Quadro 10 — Arquitetura de agentes especializados da Anicca por perfil de acesso
Agente
Função
Fonte de dados
Perfil
RAG Oncológico
Responde perguntas sobre diagnóstico, direitos, tratamento e legislação brasileira
INCA, Oncoguia, Leis 12.732 a 15.233, Portaria GM/MS 6.590/2025
Paciente / Cuidador
CTCAE
Classifica sintomas em graus 0–4 e identifica alertas de toxicidade grave para exibição informacional
NCI CTCAE v5.0
Paciente
Body Map
Processa registros de sintomas por região corporal e gera histórico temporal; vincula regiões ao CTCAE
Banco interno (PostgreSQL) + SVG anatômico
Paciente / Médico
Journaling
Gera prompts contextuais de journaling com base em sintomas CTCAE, fase do ciclo, humor e eventos da jornada
Banco interno + contexto da sessão (Redis)
Paciente
Documentos / OCR
Extrai, interpreta e cataloga laudos e exames enviados pelo paciente
AWS Textract + LLM
Paciente
Chamados
Abre, rastreia e notifica solicitações para ouvidorias, planos e secretarias de saúde
Backend interno + e-mail estruturado para hospitais sem API
Paciente
Wearables
Sincroniza dados de passos, sono, FC e HRV do smartwatch e exibe no dashboard de rotina
Google Health Connect API
Paciente
PubMed
Busca e sumariza literatura científica recente em tempo real
NCBI E-utilities API (PubMed + PMC)
Médico
Guidelines
Consulta protocolos ASCO, NCCN e SBOC via RAG especializado com Knowledge Graph
PDFs indexados + Neo4j KG
Médico
OncoKB
Identifica variantes genômicas e suas implicações terapêuticas aprovadas com nível de evidência
OncoKB REST API (MSKCC)
Médico
ClinicalTrials
Realiza matching de ensaios clínicos ativos por tipo de câncer, estágio e localização
ClinicalTrials.gov REST API
Médico / Paciente
Briefing Pré-Consulta
Sumariza os últimos 30 dias de PROs, exames pendentes e eventos de jornada antes da consulta
Banco interno + contexto da sessão
Médico

Fonte: Elaborado pelos autores (2026)
3.6.2 Grafo de Conhecimento Oncológico (Oncology Knowledge Graph)
O RAG convencional opera por similaridade semântica — eficaz para perguntas diretas, mas limitado para raciocínio relacional complexo como o exigido pelo perfil médico. Um Knowledge Graph (KG) representa entidades clínicas (tipos de câncer, mutações, medicamentos, protocolos, efeitos colaterais, ensaios) e as relações semânticas entre elas, navegáveis por consulta GraphQL. Em vez de "guidelines recomendam platina para BRCA2 mutado", o médico recebe: "BRCA2 mutado (patogênico, nível 1A no OncoKB) → indica olaparibe como manutenção pós-platina (NCCN Ovarian v2.2026, Categoria 1) → monitorar neuropatia periférica (CTCAE grau ≥2: reduzir dose para 200 mg 2x/dia)" — com cada nó rastreável à fonte primária.

O OncoKB, já integrado ao painel médico (seção 3.5), é em sua essência um KG parcial de variantes genômicas. A Anicca expande esse paradigma com Neo4j como banco de grafos, construído em três camadas progressivas: Fase 5 (agosto/2026) — entidades fundamentais (tipos de câncer por CID-10, protocolos, efeitos colaterais CTCAE, variantes OncoKB); roadmap de médio prazo — dados de jornada dos próprios pacientes da Anicca, criando ativo proprietário que nenhum concorrente possui; longo prazo — conexão com Federated Learning para enriquecimento com dados de hospitais parceiros sem que esses dados saiam de seus servidores. O BelongAI Dave, o principal concorrente, opera com RAG vetorial simples sem modelagem relacional — o KG é o diferencial técnico de raciocínio clínico da Anicca.
Figura 14 — Diagrama do Knowledge Graph oncológico (Neo4j)
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
3.6.3 Aprendizado Federado com Privacidade por Design (Federated Learning)
O modelo de risco de abandono (XGBoost + SHAP) é treinado inicialmente sobre dados gerados dentro da plataforma. Para maior generalização, a solução óbvia seria centralizar dados de hospitais parceiros — mas o Decreto 12.560/2025 veda explicitamente o compartilhamento de dados da RNDS para fins que não sejam assistenciais, de vigilância ou de pesquisa pública regulamentada. Centralizar prontuários é juridicamente inviável.

O Federated Learning (FL) resolve esse conflito: em vez de trazer os dados para o modelo, o FL leva o modelo para os dados. Cada hospital parceiro treina localmente — apenas os parâmetros aprendidos (gradientes, não dados) são enviados ao servidor de agregação, que os combina em modelo global e o redistribui. Na medicina, o FL tem evidência publicada de eficácia comparável ao treinamento centralizado, mantendo privacidade diferencial (Rieke et al., Nature Digital Medicine, 2020; Dayan et al., Nature Medicine, 2021). Revisão sistemática no npj Digital Medicine 2025 identificou 25 estudos em câncer de mama, pulmão e próstata: FL superou ML centralizado em 15 de 25 estudos.

Os três modelos beneficiados pelo FL na Anicca são: (a) risco de abandono (XGBoost) — com dados de adesão e comportamento de múltiplos hospitais sem centralizar prontuários; (b) predição de toxicidade grave — dados CTCAE de múltiplos centros para detecção precoce de toxicidade grau 3–4; (c) ranqueamento de ensaios clínicos — de busca por elegibilidade para recomendação por probabilidade de benefício com base em desfechos reais de pacientes similares. A Anicca pode afirmar com precisão técnica: "nossos modelos aprendem com dados de pacientes de múltiplos hospitais brasileiros sem que um único prontuário jamais saia do servidor de cada instituição" — inédito no mercado healthtech oncológico brasileiro.
Figura 15 — Diagrama do Federated Learning com hospitais parceiros
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
3.6.4 Integração com Wearables — Google Health Connect
A evidência clínica para wearables em oncologia é consolidada para três métricas específicas. Para variabilidade da frequência cardíaca (HRV), Shih et al. (Frontiers in Medicine, 2023) demonstraram, em 60 pacientes com câncer de pulmão, classificação correta de fadiga leve em 73% e fadiga moderada em 88% com cutoffs de HRV — tornando o HRV o biomarcador digital mais robusto para fadiga relacionada ao câncer (CRF). Para passos diários, Bennett et al. (Quality of Life Research, 2016) demonstraram em pacientes oncológicos que quedas ≥15% nos passos semanais vs. o baseline pré-quimio estão significativamente associadas a piora de sintomas e qualidade de vida. Para sono, a evidência é consistente com impacto na CRF e adesão ao tratamento.

A estratégia de integração para Android (cenário brasileiro, >80% do público SUS) é o Google Health Connect — o único SDK escalável após a depreciação do Samsung Health SDK em 31 de julho de 2025. O Health Connect agrega dados de Samsung Health, Amazfit/Zepp, Garmin, Wear OS, Oura e Whoop em uma única API, com permissões granulares on-device. A integração com Amazfit/Zepp não é viável via SDK proprietário no MVP — o Zepp OS 3 oferece apenas mini-apps no relógio, sem API pública para leitura de dados históricos em servidor externo. A solução para usuários Amazfit é o Health Connect como camada de abstração, quando o Amazfit sincroniza dados com o Health Connect nativo do Android 14+.

Quadro 12 — Dados de smartwatch clinicamente relevantes para pacientes oncológicos
Métrica
Evidência
Relevância Oncológica
Integração Anicca
Alerta Automático
Passos diários
Alta — Bennett et al., 2016; múltiplos estudos
Queda ≥15%/semana vs. baseline = sinal de deterioração funcional e piora de sintomas
Dashboard Rotina: gráfico semanal com linha de baseline pré-quimio
Não (informacional)
HRV (RMSSD)
Alta — Shih et al., 2023 (73-88% acurácia em CRF)
LF/HF discrimina fadiga leve vs. moderada-severa; marcador de recuperação entre ciclos
Dashboard Rotina: score diário de fadiga estimada por HRV
Não (informacional)
Sono (duração e eficiência)
Alta — múltiplos estudos em CRF
Fragmentação e duração reduzida correlacionam com fadiga e adesão ao tratamento
Módulo Rotina: registro automático com tendência semanal
Não
FC em repouso
Média — monitoramento geral de descompensação
Aumento sustentado >10 bpm vs. baseline = possível infecção ou cardiotoxicidade subclínica
Dashboard Rotina: tendência 7 dias
Não — sugere contato com equipe
SpO2
Baixa em câncer geral; média em pulmão
Monitoramento durante quimio para câncer de pulmão; hipoxemia subclínica
Apenas câncer de pulmão; exibição contextual sem alerta
Não
Temperatura cutânea
Insuficiente — NÃO recomendada
Precisão ±0,5°C é inadequada para triagem de febre neutropênica (limiar 37,8°C)
NÃO integrada — risco de falso negativo em emergência clínica
Não aplicável

Fonte: Elaborado pelos autores (2026)
3.6.5 Síntese — Maturidade, Viabilidade e Posicionamento Competitivo
Quadro 11 — Síntese de tecnologias emergentes: maturidade, viabilidade e fase
Tecnologia
Maturidade de evidência
Viabilidade no stack
Fase Anicca
Diferencial vs. concorrentes
Multi-Agent Orchestration (LangGraph)
Alta — ASCO 2025, medrXiv 2025, Microsoft Azure em produção
Alta — já está no stack (LangChain/LangGraph)
MVP (Fase 4–5)
Dave usa agente único; Anicca usa orquestra de agentes especializados por domínio clínico
Oncology Knowledge Graph (Neo4j + OncoKB)
Alta — OncoKB é KG consolidado (MSKCC); Neo4j em uso clínico em múltiplas instituições
Média — requer modelagem do grafo e integração Neo4j
Fase 5 (ago/26)
Nenhum app oncológico de paciente possui KG próprio; Dave opera com RAG vetorial simples
Federated Learning (PySyft / TF Federated)
Alta — Nature Medicine, Nature Digital Medicine; Google em produção desde 2017; 25 estudos em oncologia
Média — requer parceiros hospitalares e infraestrutura de agregação
Roadmap (pós-MVP)
Único modelo de ML oncológico no Brasil com privacidade LGPD by design e dados multicentro
Blockchain — audit trail consentimento (Hyperledger / Polygon)
Média — Cancer Gene Trust, JMIR 2019; adoção crescente em saúde
Alta — implementação cirúrgica; não substitui BD relacional
Fase 5 (ago/26)
Prova criptograficamente verificável de consentimento para auditoria ANPD — inédito no mercado brasileiro
Wearables via Google Health Connect
Alta — HRV (Shih et al., 2023), passos (Bennett et al., 2016)
Alta — SDK único para Android após depreciação Samsung SDK (jul/2025)
Fase 5 (ago/26)
Dados objetivos de CRF e atividade integrados à Rotina; Samsung, Amazfit e Garmin numa única API

Fonte: Elaborado pelos autores (2026)

4 PLANEJAMENTO DO PROJETO E CRONOGRAMA
O desenvolvimento da Anicca está estruturado em seis estágios progressivos, alinhados ao calendário letivo e aos marcos do Enterprise Challenge FIAP.

Quadro 5 — Cronograma de desenvolvimento da Anicca
Período
Estágio
Atividades
Status
Hub?
Fase 1–2 (fev–abr/26)
Pesquisa e Validação
Mercado, problema, personas, concorrentes, nome, identidade visual, mascote Ani, slogan
Concluído
Não
Fase 3 (abr–mai/26)
Modelagem e Ideação
Arquitetura BFF + Clean Architecture, 3 perfis, multi-agentes, Body Map, journaling, wearables, KG, FL, protocolo LGPD, stack tecnológico
Concluído
Sim — arquitetura
Fase 4 (mai–jun/26) [ATUAL]
Prototipação
Wireframes alta fidelidade (12 telas), setup dev (FastAPI BFF + Next.js + RN), Whatsmiau Cloud API sandbox, RAG INCA, Body Map SVG v1, LangGraph v1, agentes paciente, onboarding guiado, journaling mock
Em andamento
Sim — WhatsApp + RAG + LangGraph
Férias Jul/26
Implementação Parcial
Frontend RN (telas principais), FastAPI BFF (endpoints mensagem/chamados/médico), PostgreSQL + pgvector, OCR sandbox, Zustand stores, React Query, Body Map interativo, Google Health Connect, agentes médico v1
Planejado
Sim — backend + agentes médico
Fase 5 (ago/26)
MVP Funcional
Go-live WhatsApp, LLM + RAG completo, ML risco abandono v1, app RN publicado, portal web beta, perfis completos, KG Neo4j Camada 1, blockchain consentimento, wearables v1
Planejado
Sim — hub completo
Fase 6 (set/26)
Banca Final
Testes usabilidade (min. 3 usuários por perfil), ajustes UX, documentação final, pitch banca Claro/FIAP, demonstração ao vivo
Planejado
Sim — demonstração

Fonte: Elaborado pelos autores (2026)

As etapas críticas do hub são: integração Whatsmiau Cloud e LangGraph multi-agente (Fase 4, maio/junho 2026), backend BFF com agentes do painel médico e Google Health Connect (julho 2026), go-live completo com KG e blockchain (Fase 5, agosto 2026), e demonstração ao vivo para a banca da Claro (Fase 6, setembro 2026).

5 DESENVOLVIMENTO DO PROJETO
5.1 MAPEAMENTO DE FUNCIONALIDADES
As funcionalidades foram mapeadas a partir de: revisão sistemática de literatura (Evans Webb et al., 2021 — três eixos de necessidade: illness-work, everyday-work e biographical-work); análise de apps internacionais (BelongAI Dave, OWise, OncoDiary, LivingWith/Pfizer, ACS CARES); relatos de pacientes (Abrale, Oncoguia, FEMAMA, Reclame Aqui); e pesquisa primária sobre a jornada real no SUS (SISREG, APAC, TFD, direitos legais).

Quadro 1 — Mapeamento exaustivo de funcionalidades da Anicca por necessidade e perfil
Necessidade
Funcionalidade Detalhada
Perfil
Canal
Prioridade
Entender o diagnóstico
OCR (AWS Textract) processa foto do laudo enviada pelo paciente; LLM traduz termos técnicos (BIRADS, Gleason, CID-10) para linguagem CEFR A2; extrai achados principais; gera 3 perguntas para o médico; arquiva automaticamente em Meus Documentos > Patologia e Biópsia com destaque do achado mais relevante
Paciente
WhatsApp/App/Web
MVP
Conhecer direitos legais
RAG sobre leis oncológicas brasileiras (12.732, 13.896, 14.450, 14.758, 15.233); simulador interativo da Lei dos 60 dias (cronômetro desde a data do laudo histopatológico com semáforo verde/âmbar/vermelho); gerador de petição para Defensoria/MP quando o prazo é violado; direitos trabalhistas (FGTS, INSS, isenção IR) em linguagem simples
Paciente
WhatsApp/App/Web
MVP
Encontrar onde se tratar
Mapa interativo de CACONs e UNACONs via CNES/DATASUS (tipo 36 = oncologia); filtro por CEP do paciente; distância, telefone, endereço, horário; indicador de distância >50 km para elegibilidade TFD; checklist de documentos necessários por tipo de câncer (APAC, biomarcadores)
Paciente
App/Web
MVP
Entender exames laboratoriais
Explicação de valores laboratoriais (hemograma completo: neutrófilos, plaquetas, hemoglobina; bioquímica: creatinina, TGO, TGP, bilirrubinas; marcadores: CEA, CA125, AFP, PSA) em linguagem acessível; tendência comparativa entre coletas ao longo dos ciclos; alerta educacional quando neutrófilos <1.000 (orientação para buscar atendimento, não diagnóstico)
Paciente
WhatsApp/App
MVP
Registrar sintomas com Body Map
Body Map SVG interativo (silhueta frontal e dorsal tocável); ao tocar na região afetada: modal com escala de intensidade 0–10, seleção de tipo de sintoma (dor, dormência, inchaço, vermelhidão, ferida, outro) e campo de texto livre; histórico temporal por região com linha do tempo e código de cor por intensidade; relatório exportável para o médico por região e período
Paciente
App/Web
MVP
Escala CTCAE de sintomas
7 sintomas (náusea, fadiga, dor, mucosite, neuropatia periférica, diarreia, apetite) em cards com emoji identificador e descrição em linguagem CEFR A2; 5 botões de grau (0–4) com mudança dinâmica de cor; rótulo textual do grau (ex: Grau 2 — Feridas moderadas); indicador circular de carga sintomática total; botão Salvar com data e horário; grau 4 em qualquer sintoma: banner vermelho com número de emergência do serviço de oncologia e orientação ao PS — posicionado como informação educacional, não alerta clínico automatizado (evitar SaMD)
Paciente
App
MVP
Matching de ensaios clínicos
Busca automática em ClinicalTrials.gov pelo tipo de câncer (CID-10), estágio e localização do paciente; apresentação em cards com critérios de elegibilidade simplificados em linguagem acessível; botão de salvar e compartilhar com o médico
Paciente/Médico
App/Web
Fase 5
Gerenciar medicamentos
Cadastro de medicamentos com nome, dose, horário e tipo (quimio oral, anti-náusea, suporte, domiciliar); alertas de horário via WhatsApp e notificação push; marcação como tomado por toque; contador de adesão diário no cabeçalho da Rotina; código de cor por tipo; sugestão de reabastecimento quando o estoque está baixo
Paciente
WhatsApp/App
MVP
Lembrar consultas e ciclos
Cadastro de consultas e ciclos de quimio/radio/imunoterapia; sincronização com calendário nativo (iOS/Android); lembretes configuráveis (1 dia antes, 2h antes); notificação de confirmação via WhatsApp; checklist pré-consulta gerado pelo Ani com base no perfil (o que perguntar ao médico, o que trazer)
Paciente
WhatsApp/App
MVP
Monitor de temperatura
Campo de entrada numérica na tela de Rotina; alerta educacional (banner laranja) se ≥37,8°C com orientação clara de ligar para o número de plantão oncológico — posicionado como informação de suporte, não triagem automática (alinhado com recomendações IDSA/ASCO de febre neutropênica)
Paciente
App
MVP
Hidratação
Rastreador de 8 copos interativos com mensagem educativa sobre a importância da hidratação durante a quimioterapia; lembrete configurável pelo paciente; registro histórico de consumo diário
Paciente
App
MVP
Sono
Campo de registro de duração do sono (horas) e qualidade subjetiva (escala 1–5 com emoji); integrado com dados automáticos do smartwatch via Google Health Connect quando disponível; gráfico de tendência semanal; Ani sugere higiene do sono personalizada baseada nos registros (posicionado como orientação educacional)
Paciente
App
MVP
Atividade física adaptada
Biblioteca de exercícios de baixo impacto adaptados por tipo de câncer e fase do tratamento; instruções em vídeo curto (≤3 min); integração com dados de passos do smartwatch (Google Health Connect); pesquisa consolidada mostra redução de 40–50% da fadiga oncológica com exercício físico moderado durante a quimio (Cochrane, 2019)
Paciente
App
Fase 5
Nutrição no tratamento
Guia de alimentação personalizado por fase (pré-quimio, durante quimio, pós-quimio, radioterapia, pós-cirurgia); alimentos que aliviam náusea e mucosite; alimentos a evitar por tipo de tratamento; sugestões práticas para apetite reduzido
Paciente
App/Web
Fase 5
Cuidado oral
Guia de higiene bucal durante quimio (mucosite, escova ultramacia, enxaguante sem álcool, bochechos de água morna com sal); lembretes de escovação; reconhecimento de sinais de mucosite grau 2+ para orientação de busca de atendimento
Paciente
App
Fase 5
Acompanhar jornada
Timeline visual da jornada oncológica (diagnóstico → tratamento → seguimento) com semáforo da Lei dos 60 dias; marcos registrados com data; relatório exportável da jornada completa para levar a consultas
Paciente/Cuidador
App/Web
MVP
Meus Documentos
Central inteligente: OCR cataloga automaticamente documentos recebidos de qualquer canal (foto, WhatsApp, chat, upload); cada documento recebe badge de origem e destaque gerado por IA com a informação mais relevante (ex: Neutrófilos 980 → em queda); 7 categorias colapsáveis (Hemograma/Exames, Imagem TC/RM/PET, Patologia/Biópsia, Consultas/Relatórios, Prescrições, Plano/Seguro, SUS/INSS/RNDS); barra de busca por palavra-chave
Paciente
App/Web
MVP
Journaling emocional contextual
Check-in diário às 21h (horário configurável) iniciado pelo Ani via WhatsApp ou notificação no app; escala de humor por emoji (4 opções); prompt gerado pelo LLM com base no contexto clínico real do dia (sintomas CTCAE do dia anterior, fase do ciclo, padrão de humor dos últimos 7 dias, marcos da jornada); escrita livre privada por padrão; opt-in individual por entrada para incluir no resumo pré-consulta do médico; recursos de bem-estar contextuais (respiração 4-7-8 para ansiedade, body scan para dor, gratidão para dias bons, carta para si mesma no futuro — entregue na alta estimada)
Paciente
WhatsApp/App
MVP
Logística TFD
Guia de elegibilidade ao TFD (regra dos 50 km, documentos necessários: laudo médico, CNS, CPF, comprovante de residência); verificação de distância CEP paciente ↔ CACON; geração de modelo de solicitação de TFD; contato direto com secretaria municipal de saúde via app
Paciente
WhatsApp/App
Fase 5
Suporte financeiro
Guia de auxílios disponíveis: auxílio-doença INSS (sem carência para neoplasia maligna), isenção de IR sobre aposentadoria (Lei 7.713/88), saque de FGTS e PIS/Pasep (Lei 8.036/90 art. 20 IX), BPC/LOAS para baixa renda, aposentadoria por invalidez + 25% se assistência permanente, quitação de financiamento imobiliário SFH por invalidez; calculadora simples de elegibilidade por perfil do paciente
Paciente
App/Web
Fase 5
Peruca e prótese
Informação sobre direitos: SUS cobre prótese mamária externa após mastectomia (Lei 9.797/1999); onde obter óculos e outros recursos; grupos de apoio para perda de cabelo; orientações práticas sobre cuidado do couro cabeludo durante a quimio
Paciente
App/Web
Fase 5
Abrir chamados
Abertura em 3 passos: (1) seleção do tipo em cards visuais (tratamento atrasado, laudo não recebido, TFD, ouvidoria/denúncia, APAC, plano de saúde, outro); (2) descrição em texto livre com sugestão de texto gerada pelo LLM; (3) seleção de canal de encaminhamento ajustado pela modalidade do usuário (SUS: Ouvidoria Hospitalar, CONASS, SMS Municipal, Ministério Público; Convênio: ANS; Particular: PROCON); confirmação com número de protocolo único; histórico com badges de status; notificações proativas de atualização via WhatsApp
Paciente
WhatsApp/App/Web
MVP
Suporte emocional e psicossocial
Chat com Ani com persona empática; exercícios de respiração 4-7-8, body scan guiado de 5 minutos e mindfulness curto disponíveis a qualquer momento; encaminhamento para grupos de apoio parceiros (Oncoguia, ABRALE, FEMAMA); artigos sobre isolamento social, comunicação do diagnóstico com familiares e retorno ao trabalho
Paciente
WhatsApp/App
MVP
Comunicação com pessoas queridas
Guia prático em linguagem simples sobre como falar do diagnóstico: com familiares adultos, com filhos (por faixa etária), com colegas de trabalho, com o chefe; modelos de mensagem editáveis pelo paciente
Paciente
App/Web
Fase 5
Sexualidade e fertilidade
Informação sobre o impacto do tratamento na sexualidade e fertilidade (por tipo de tratamento); recursos especializados; módulo acessado de forma discreta e opcional (não aparece no dashboard padrão — ativado nas configurações de perfil)
Paciente
App (privado)
Roadmap
Painel do cuidador
Dashboard com todos os dados do paciente vinculado (com permissão explícita deste): timeline da jornada, próximas consultas e ciclos, Body Map de sintomas, chamados abertos, alertas de risco de abandono gerados pelo ML; badge de permissão visível em todos os dados; cuidador pode adicionar ao calendário e abrir chamados em nome do paciente
Cuidador
App/Web
MVP
Suporte ao cuidador
Recursos de autocuidado para o cuidador: artigos sobre burnout do cuidador, lembretes de próprias consultas, comunidade de cuidadores parceiros
Cuidador
App/Web
Fase 5
Painel clínico (médico)
Lista de pacientes vinculados com: iniciais, tipo de câncer, ciclo atual, último registro CTCAE, score de risco de abandono (badge colorido gerado pelo ML: verde/amarelo/vermelho), dias desde o último acesso ao app; ao selecionar paciente: Body Map temporal com histórico de sintomas por região, evolução CTCAE em gráfico, documentos compartilhados, timeline de jornada, campo de mensagem segura criptografada com log de auditoria; anotações clínicas privadas por região no Body Map
Médico
App/Web
MVP
Briefing pré-consulta
Agente Briefing gera automaticamente um resumo em 1 parágrafo dos últimos 30 dias do paciente antes de cada consulta: sintomas CTCAE (média e pico), passos e sono (se smartwatch conectado), humor do journaling, exames pendentes, chamados abertos, aderência a medicamentos; posicionado como ferramenta informacional (não recomendação clínica)
Médico
App/Web
MVP
IA clínica multi-agente
Agentes PubMed + Guidelines + OncoKB + ClinicalTrials acionados simultaneamente para consultas complexas; cada recomendação com citação rastreável à fonte primária; Knowledge Graph oncológico para raciocínio relacional (mutações → terapias → efeitos colaterais); posicionado como suporte de decisão com revisão humana obrigatória — não substitui o julgamento clínico
Médico
App/Web
MVP
Calculadoras clínicas informacionais
ECOG performance status (0–5), Karnofsky (0–100%), Cockcroft-Gault (CrCl para ajuste renal), Mosteller (BSA para dosagem), AUC de Calvert (carboplatina), MASCC score (risco de neutropenia febril); todas posicionadas como calculadoras de referência pura — sem sugestão automática de conduta (evitar SaMD Classe II)
Médico
App/Web
Fase 5
Avatar personalizável
Tom de pele (6 opções), cabelo/acessório de cabeça (incluindo careca, turbante, lenço, boné, peruca — respeitando a realidade da quimio), expressão facial (4 estados emocionais), acessório especial (cateter port-a-cath, bolsa de quimio, bengala, neutro), cor de fundo personalizável; preview em tempo real; sincronização entre todos os canais
Paciente
App/Web
MVP
Integração smartwatch
Google Health Connect como camada de abstração universal para Android (Samsung Galaxy Watch, Amazfit via Health Connect, Garmin, Wear OS); dados coletados: passos diários, sono (duração e eficiência), FC em repouso, HRV (RMSSD); exibição no dashboard de Rotina com tendência semanal e linha de baseline; temperatura cutânea excluída por precisão insuficiente para contexto oncológico
Paciente
App (Android)
Fase 5
Histórico de conversas
Registro pesquisável de todas as interações com Ani por canal, data e módulo acionado; exportável em PDF
Todos
App/Web
MVP
Modo acessível
Fonte 18 px, contraste AAA (7:1), opções de áudio automático para respostas do Ani, máximo 2 opções por tela no modo simplificado; ativado nas configurações ou sugerido pelo Ani após detectar padrão de dificuldade de navegação
Todos
App/Web
MVP
Importação RNDS
Paciente exporta histórico do Meu SUS Digital (PDF ou JSON FHIR) e compartilha com a Anicca; parse automático popula: data do diagnóstico, medicamentos em uso, histórico de exames; CPF solicitado apenas neste módulo — não no cadastro geral
Paciente
App/Web
MVP
Compartilhamento para pesquisa (Federated Learning)
Opt-in explícito e separado do consentimento principal; dados de jornada gerados na Anicca (sintomas registrados, tempos de jornada, adesão ao tratamento) são usados para treinar modelos federados sem saírem da infraestrutura; o paciente vê um painel de impacto ("seus dados ajudaram X pesquisadores") como incentivo positivo
Paciente
App/Web
Fase 5

Fonte: Elaborado pelos autores (2026)
5.2 ONBOARDING DETALHADO E TELA DE CADASTRO
O onboarding da Anicca é guiado pelo Ani de forma conversacional, equilibrando a leveza do mascote com a seriedade do contexto oncológico. O cadastro é opcional na primeira abertura — zero-friction onboarding. O Ani usa animações suaves (Lottie) e linguagem empática, com progressão linear de sete etapas.

5.2.1 Etapas do Onboarding
Etapa 1 — Boas-vindas: Ani se apresenta com animação de entrada. Dois botões: "Vamos começar" e "Explorar sozinho" (ativa modo autônomo). Etapa 2 — Perfil: três cards (Sou o paciente / Sou o cuidador / Médico ou Enfermeiro). Etapa 3 — Informações básicas (paciente): tipo de câncer (autocomplete CID-10 simplificado), fase do tratamento, modalidade (SUS/convênio/particular). Para cuidador: vínculo com o paciente (código de convite ou QR code). Etapa 4 — Personalidade do Ani: quatro opções (Mentora, Realista, Otimista, Especialista) com avatar e exemplo de fala. Etapa 5 — Avatar (opcional): personalização em quatro dimensões (tom de pele, cabelo/acessório, expressão, acessório médico). Etapa 6 — Permissões e LGPD: três toggles simples (notificações, câmera, calendário) com Termo em linguagem CEFR A2. Etapa 7 — Hub principal: Ani apresenta os módulos com primeira sugestão contextual baseada no perfil.

5.2.2 Tela de Cadastro (Opcional)
Apresentada como oportunidade após a Etapa 7. Campos: nome, e-mail, telefone celular (vincula ao WhatsApp do perfil), senha (mínimo 8 caracteres, sem regras complexas), ou login social (Google/Apple). CPF solicitado apenas no módulo de importação RNDS. Ani celebra o cadastro com animação de confirmação.
Figura 3 — Wireframe: fluxo de onboarding guiado pelo Ani (7 etapas)
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
Figura 4 — Wireframe: tela de cadastro (opcional)
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.3 WIREFRAMES DAS TELAS PRINCIPAIS
Os wireframes seguem WCAG 2.1 AA, Conversation Design Institute e boas práticas de GenUI. Todas as telas oferecem alternância entre modo guiado pelo Ani e modo autônomo.

5.3.1 Hub Principal com Generative UI
Cabeçalho: avatar do usuário, nome e ciclo atual. Barra de busca inteligente — ponto de entrada da GenUI. Ao digitar palavras-chave ou regiões corporais ("dor no estômago"), renderiza inline cards CTCAE ou abre o Body Map pré-selecionado. Cards de atalho: próximo ciclo, sintomas do dia, último exame (tendência neutrófilos), timeline Lei dos 60 dias. Navegação inferior: Hub, Ani, Rotina, Docs.
Figura 5 — Wireframe: Hub principal com Generative UI e Body Map
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.3.2 Body Map Interativo
Silhueta SVG frontal e dorsal tocável. Paciente: toque em região → modal com escala de intensidade, seleção de tipo de sintoma, texto livre; histórico temporal por região com timeline e código de cor. Médico: Body Map exibe registros do paciente ao longo do tempo com filtro por data e tipo; regiões mais frequentes destacadas com intensidade de cor; anotações clínicas privadas por região.
Figura 6 — Wireframe: Body Map interativo (visão paciente e visão médico)
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.3.3 Rotina de Hoje
5 blocos em rolagem vertical: (1) Temperatura (alerta educacional ≥37,8°C); (2) Medicamentos por período (manhã/tarde/noite), marcados por toque; (3) Hidratação (8 copos interativos); (4) Sono (entrada manual + dados automáticos do smartwatch via Health Connect); (5) CTA de Sintomas → Body Map/CTCAE.
Figura 7 — Wireframe: módulo de Rotina de Hoje
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.3.4 Journaling Emocional Contextual
Check-in noturno: Ani inicia com escala de humor (emoji, 4 opções) → prompt adaptado ao contexto clínico real → escrita livre privada → opt-in para incluir no resumo do médico → recurso de bem-estar contextual (respiração, body scan ou gratidão). No app: histórico de humor em gráfico correlacionado com eventos CTCAE e da jornada.
Figura 12 — Wireframe: módulo de journaling emocional contextual
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.3.5 Painel do Médico com IA Clínica Multi-Agente
Lista de pacientes com score de risco e alertas ML. Ao selecionar: Body Map temporal, evolução CTCAE, briefing pré-consulta gerado automaticamente, documentos compartilhados, mensagens seguras. Campo de consulta livre para IA clínica — Ani aciona os agentes especializados em paralelo e sintetiza com citação de fonte por recomendação.
Figura 11 — Wireframe: painel do médico com IA clínica e multi-agentes
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.4 JORNADA DO USUÁRIO
A jornada mapeada representa o fluxo da paciente Rosa Silva, 52 anos, diagnosticada com câncer de mama estágio II em Caruaru/PE, atendida pelo SUS. O mesmo fluxo se aplica a pacientes de convênio ou particular, com encaminhamentos e textos adaptados automaticamente.

Dia 0 — diagnóstico e onboarding: Rosa encontra o QR code na UBS. Ani se apresenta com animação suave. Rosa escolhe "Sou a paciente", informa câncer de mama e modalidade SUS, escolhe persona Mentora e personaliza avatar (careca, tom médio, determinada, port-a-cath). Seleciona "Entender meu laudo" e fotografa o laudo. O Agente Documentos + OCR processa, o Agente RAG explica em linguagem simples, arquiva em Meus Documentos e gera 3 perguntas para o oncologista.

Dia 1 — direitos e Body Map: Rosa digita "dor no peito" na barra do Hub. A GenUI abre o Body Map com a região torácica pré-selecionada. Rosa registra dor grau 2. Ani explica a Lei dos 60 dias com timeline semafórica. O Agente Chamados abre um chamado preventivo com protocolo; confirmação no WhatsApp.

Dia 22 — rotina de tratamento: Rosa registra temperatura 37,2°C (normal), marca medicamentos da manhã. A Dra. Renata acessa o painel médico, visualiza o briefing pré-consulta automático e consulta o Ani clínico: "minha paciente está no Ciclo 3 de AC com fadiga grau 3 e dor torácica". Ani aciona simultaneamente os Agentes PubMed, Guidelines e OncoKB. Resultado: protocolo de manejo de fadiga em AC + artigos recentes + variantes BRCA2 relevantes + 2 ensaios clínicos ativos na região.

Dia 21 (noturno) — journaling: Ani inicia check-in. Rosa marca "Difícil". Ani: "Ciclo 3 costuma ser mais pesado. O que foi mais difícil hoje?" Rosa seleciona "O medo". Ani convida à escrita livre. Rosa escreve. Ani pergunta se inclui no resumo da consulta. Rosa aceita. Ani oferece respiração 4-7-8. Rosa conclui sentindo-se mais leve.

Dia 34 — protocolo de silêncio: ML detecta 12 dias sem acesso e queda de sentimento. Score de risco sobe para 58% (médio). Ani envia UMA mensagem empática via WhatsApp. Se Rosa não responde em 48h: modo de silêncio ativo, Dra. Renata notificada no painel. Zero mensagens automáticas adicionais até iniciativa humana.
Figura 2 — Jornada do usuário: paciente oncológica Rosa Silva
[Inserir imagem/wireframe aqui]
Fonte: Elaborado pelos autores (2026)
5.5 PERSONAS
As três personas foram construídas a partir de dados do IBGE (PNAD Contínua TIC 2024), literatura clínica brasileira e depoimentos públicos coletados em portais de pacientes.

Quadro 3 — Personas da Anicca
Atributo
Rosa Silva (Paciente)
Juliana Costa (Cuidadora)
Dra. Renata Lima (Médica)
Perfil
Paciente — Sou a paciente
Cuidadora — Sou o cuidador
Oncologista — Médico/Enfermeiro
Idade
52 anos
31 anos
38 anos
Localização
Caruaru/PE
São Paulo/SP (cuida à distância)
Recife/PE — CACON de referência
Modalidade
SUS
Convênio (plano da empresa)
Atende SUS e convênio
Dispositivo
Android básico (4 GB RAM)
iPhone 14 / MacBook
iPad Pro / MacBook
Canal preferido
WhatsApp (zero fricção)
App nativo / Portal web
Web (painel clínico)
Persona Ani
Mentora — encorajadora e empática
Especialista — técnica e detalhada
N/A — acessa painel clínico direto
Avatar
Careca, tom médio, expressão determinada, port-a-cath
Cabelo curto, óculos, fundo roxo
N/A
Smartwatch
Sem smartwatch no MVP — dados manuais
Samsung Galaxy Watch (dados via Health Connect)
N/A
Módulos prioritários
Body Map, Rotina, Journaling, Documentos, Direitos, Chamados
Hub (dados da mãe), Chamados, Timeline, Alertas ML
Briefing pré-consulta, IA clínica, Body Map temporal, Msgs seguras
Dor principal
Laudo incompreensível; não sabe o próximo passo; isolamento emocional
Sem visibilidade da jornada da mãe; medo de não ajudar a tempo
Sem ferramenta para monitorar adesão remotamente e acessar literatura com rapidez
Barreira digital
Não baixa apps novos; prefere WhatsApp
Sem barreira; quer funcionalidade avançada
Quer painel rápido e integrado; não tem tempo para sistemas lentos

Fonte: Elaborado pelos autores (2026)
5.6 ANÁLISE DE CONCORRENTES
O Quadro 2 apresenta a análise comparativa dos principais concorrentes da Anicca, incluindo os novos apps identificados na pesquisa expandida de mercado.

Quadro 2 — Análise comparativa de concorrentes
Concorrente
Foco
IA Conv.
SUS
Hub Omni.
Médico
Ameaça
Gap para Anicca
BelongAI Dave
IA conv. oncológica, matching ensaios (Tara), 7 anos dados proprietários, validado ASCO 2024
Sim (LLM)
Não
Não
Não
Alta
Sem WhatsApp; sem Body Map; sem painel médico; sem chamados; sem foco SUS/Brasil; RAG simples (sem KG)
OWise (mama/próstata)
Tracking clínico, 30+ EAs, CE-marked, NHS-approved, compartilhamento com médico
Não
Não
Não
Parcial
Alta
Apenas 2 tipos de câncer; sem IA conversacional; sem WhatsApp; sem Body Map universal
OncoDiary
Journaling oncológico, comunidade, meditações, mindfulness
Não
Não
Não
Não
Alta
Sem IA clínica; sem tracking clínico; sem WhatsApp; sem médico; journaling genérico
WeCancer / Cecí
Monitoramento sintomas B2B hospitalar
Não
Marginal
Não
Parcial
Alta
Sem WhatsApp; B2B hospitalar; sem jornada completa; sem KG
Oncoguia (ONG)
Informação e suporte, 0800/WhatsApp humano
Não
Sim
Não
Não
Média
Humano não escalável; sem app; sem IA; horário comercial
Vann: Cancer Survivor
Comunidade peer-to-peer de sobreviventes
Não
Não
Não
Não
Média
Foco em comunidade/identidade; sem jornada individual; sem Body Map
Cancer Exercise
Exercícios adaptados por tipo de câncer e fase
Não
Não
Não
Não
Média
Escopo mínimo; complementar à Anicca (módulo de atividade física)
Cancer Survivorship Center
Recursos para pós-tratamento e qualidade de vida
Não
Não
Não
Não
Média
Foco em pós-tratamento; sem acompanhamento ativo; roadmap da Anicca
Mon Réseau Cancer
Rede social oncológica francesa
Não
Não
Não
Não
Baixa
Foco no sistema de saúde francês; sem IA; referência conceitual
Kids Guide to Cancer
App educativo pediátrico para crianças entenderem o câncer
Não
N/A
Não
Não
Baixa
Referência para módulo pediátrico (tutelar) da Anicca no roadmap
MFHP: Cancer (CDC)
Hereditariedade e histórico familiar; prevenção primária
Não
N/A
Não
Não
Baixa
Foco em prevenção (sem diagnóstico ativo); público diferente
Physicians Cancer Chemo
Referência de quimioterapia para médicos (estática)
Não
N/A
Não
Parcial
Baixa
Referência estática; sem IA; substituível pelo painel médico multi-agente da Anicca
OncoSus (Min. Saúde)
Documentação normativa para gestores; desatualizado
Não
Sim
Não
Não
Baixa
Foco em gestor; sem conversa; defasado
ANICCA
Navegação oncológica completa — diagnóstico ao pós-tratamento
Sim (MAS+RAG+KG)
Sim (foco SUS)
Sim
Sim (IA clínica)
—
—

Fonte: Elaborado pelos autores (2026)
5.7 IMPLEMENTAÇÃO TÉCNICA — CÓDIGO FRONTEND
Esta seção reserva o espaço para o código frontend das telas principais desenvolvidas nesta fase. A implementação utiliza React Native (Expo SDK 52), TypeScript estrito, NativeWind v4, Zustand, React Query e FastAPI BFF. As telas implementadas em código real nesta entrega são: (a) Onboarding guiado pelo Ani (etapas 1 a 7); (b) Hub com Generative UI e integração ao Body Map SVG; (c) Rotina de Hoje com monitor de temperatura, medicamentos, hidratação, sono e dados de smartwatch.

O Body Map SVG é implementado com React Native Gesture Handler + SVG paths por região anatômica, com suporte a toque, histórico temporal e sincronização com o backend FastAPI via React Query. A integração com Google Health Connect utiliza a biblioteca react-native-health-connect (mantida ativamente), que mapeia os tipos de dados do Health Connect para o schema da Rotina na Anicca.

[Inserir link do repositório GitHub e capturas de tela do código/protótipo funcional ao finalizar a implementação desta fase.]

REFERÊNCIAS
ABRALE — ASSOCIAÇÃO BRASILEIRA DE LINFOMA E LEUCEMIA. São Paulo descumpre lei para iniciar tratamento de câncer em 60 dias, e pacientes se desesperam. Disponível em: <https://abrale.org.br>. Acesso em: 20 mai. 2026.
AMAZON WEB SERVICES. Amazon Textract Documentation. 2025. Disponível em: <https://aws.amazon.com/textract>. Acesso em: 20 mai. 2026.
ANTHROPIC. Claude Sonnet 4.5 Model Documentation. 2025. Disponível em: <https://docs.anthropic.com>. Acesso em: 20 mai. 2026.
AOSW — ASSOCIATION OF ONCOLOGY SOCIAL WORK. Apps to Support Patients and Families in Navigating the Cancer Trajectory. 2024. Disponível em: <https://aosw.org>. Acesso em: 20 mai. 2026.
BENNETT, A. V.; REEVE, B. B.; BASCH, E. M. et al. Evaluation of pedometry as a patient-centered outcome in patients undergoing hematopoietic cell transplant. Quality of Life Research, v. 25, n. 3, p. 535–546, 2016. DOI: 10.1007/s11136-015-1179-0.
BRASIL. Lei n.º 12.732, de 22 de novembro de 2012. Dispõe sobre o primeiro tratamento do paciente com neoplasia maligna comprovada. Brasília: Presidência da República, 2012.
BRASIL. Lei n.º 13.896, de 30 de outubro de 2019. Altera a Lei n.º 12.732/2012, incluindo prazo para diagnóstico. Brasília: Presidência da República, 2019.
BRASIL. Lei n.º 14.758, de 19 de dezembro de 2023. Institui a Política Nacional de Prevenção e Controle do Câncer. Brasília: Presidência da República, 2023.
BRASIL. Lei n.º 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília: Presidência da República, 2018.
BRASIL. Decreto n.º 12.560, de 2025. Regulamenta o compartilhamento, a proteção e a governança dos dados de saúde no SUS, fortalecendo a RNDS. Brasília: Presidência da República, 2025.
BRASIL. Portaria SAS/MS n.º 470, de 22 de abril de 2021. Disciplina o processo de autorização dos procedimentos ambulatoriais de alta complexidade em oncologia. Brasília: Ministério da Saúde, 2021.
BRASIL. Portaria SAS/MS n.º 55, de 24 de fevereiro de 1999. Regulamenta o Tratamento Fora de Domicílio (TFD). Brasília: Ministério da Saúde, 1999.
CONVERSATION DESIGN INSTITUTE. Principles of Conversation Design. 2025. Disponível em: <https://conversationdesigninstitute.com>. Acesso em: 20 mai. 2026.
COPILOTKIT. The Developer's Guide to Generative UI in 2026. 2026. Disponível em: <https://copilotkit.ai>. Acesso em: 20 mai. 2026.
DATASUS — DEPARTAMENTO DE INFORMÁTICA DO SUS. Cadastro Nacional de Estabelecimentos de Saúde (CNES). Disponível em: <https://datasus.saude.gov.br/cnes>. Acesso em: 20 mai. 2026.
DAYAN, I. et al. Federated learning for predicting clinical outcomes in patients with COVID-19. Nature Medicine, v. 27, p. 1735–1743, 2021. DOI: 10.1038/s41591-021-01506-3.
EVANS WEBB, M. et al. The Supportive Care Needs of Cancer Patients: a Systematic Review. Journal of Cancer Education, v. 36, n. 5, p. 899–908, 2021. DOI: 10.1007/s13187-020-01941-9.
FAPESP. Mensagens de WhatsApp ajudam idosos atendidos pelo SUS a sair da depressão. 2024. Disponível em: <https://agencia.fapesp.br>. Acesso em: 20 mai. 2026.
FERBER, M. et al. Development and validation of an autonomous artificial intelligence agent for clinical decision-making in oncology. Nature Cancer, 2025. DOI: 10.1038/s43018-025-00991-6.
GOOGLE DEVELOPERS. Introducing A2UI: An open project for agent-driven interfaces. 2025. Disponível em: <https://developers.googleblog.com>. Acesso em: 20 mai. 2026.
GRAETZ, I. et al. Mobile application to support oncology patients during treatment on patient outcomes: Evidence from a randomized controlled trial. Cancer Medicine, v. 12, n. 5, p. 6190–6199, 2023.
GROSSMAN, R. L. et al. Blockchain-Authenticated Sharing of Genomic and Clinical Outcomes Data of Patients With Cancer: A Prospective Cohort Study. JMIR Medical Informatics, v. 7, n. 2, e13595, 2019. DOI: 10.2196/13595.
IBGE — INSTITUTO BRASILEIRO DE GEOGRAFIA E ESTATÍSTICA. PNAD Contínua TIC 2024. Disponível em: <https://ibge.gov.br>. Acesso em: 20 mai. 2026.
INCA — INSTITUTO NACIONAL DE CÂNCER. Estimativa 2023: incidência de câncer no Brasil. Revista Brasileira de Cancerologia, v. 69, n. 1, p. e-213700, 2023.
JMIR CANCER. Features of Cancer mHealth Apps and Evidence for Patient Preferences: Scoping Literature Review. JMIR Cancer, v. 9, p. e37330, 2023.
LIGA VENTURES. Healthtechs brasileiras movimentaram R$ 799 milhões em 2024. São Paulo: Liga Ventures, 2025.
MEDIUM — REACT NATIVE JOURNAL. Clean Architecture for Large React Native Apps. 2025. Disponível em: <https://medium.com/react-native-journal>. Acesso em: 20 mai. 2026.
WHATSMIAU CLOUD. Whatsmiau Cloud Documentation. 2025. Disponível em: <https://whatsmiau.dev/docs#intro>. Acesso em: 20 mai. 2026.
MICROSOFT. Developing next-generation cancer care management with multi-agent orchestration. Microsoft Industry Blog, maio 2025. Disponível em: <https://microsoft.com/industry/blog/healthcare>. Acesso em: 20 mai. 2026.
MINISTÉRIO DA SAÚDE. Portaria GM/MS n.º 6.590, de 26 de dezembro de 2025. Política Nacional de Prevenção e Controle do Câncer. Brasília, 2025.
MINISTÉRIO DA SAÚDE — DATASUS. Rede Nacional de Dados em Saúde (RNDS). Disponível em: <https://rnds.saude.gov.br>. Acesso em: 20 mai. 2026.
NATIONAL CANCER INSTITUTE (NCI). Common Terminology Criteria for Adverse Events (CTCAE), Version 5.0. 2017. Disponível em: <https://ctep.cancer.gov>. Acesso em: 20 mai. 2026.
OBSERVATÓRIO DE ONCOLOGIA; INSTITUTO VENCER O CÂNCER. Radar do Câncer: Lei de 30 e 60 dias. 2025. Disponível em: <https://radardocancer.org.br>. Acesso em: 20 mai. 2026.
ONCOGUIA — INSTITUTO. Direitos de pacientes com câncer existem, mas esbarram em desinformação e demora. 2026. Disponível em: <https://oncoguia.org.br>. Acesso em: 20 mai. 2026.
ONCOGUIA — INSTITUTO. Entre a fila do SUS e a vida: prazo para cirurgia mantém patamar recorde pós-pandemia. 2025. Disponível em: <https://oncoguia.org.br>. Acesso em: 20 mai. 2026.
RIEKE, N. et al. The future of digital health with federated learning. NPJ Digital Medicine, v. 3, p. 119, 2020. DOI: 10.1038/s41746-020-00323-1.
SAMSUNG DEVELOPER. Samsung Health Data SDK — Release Notes. 2025. Disponível em: <https://developer.samsung.com/health/data/release-note.html>. Acesso em: 20 mai. 2026.
SHIH, H.-C. et al. Cancer-related fatigue classification based on heart rate variability signals from wearables. Frontiers in Medicine, v. 10, p. 1103979, 2023. DOI: 10.3389/fmed.2023.1103979.
SOCINSKI, M. A. et al. Artificial intelligence as a decision support tool for practicing oncologists. JCO Oncology Practice, v. 21, n. 10_suppl, p. 557, 2025.
THESYS. Generative UI Report 2025. 2025. Disponível em: <https://thesys.dev/report/gen-ui-2025>. Acesso em: 20 mai. 2026.
W3C. Web Content Accessibility Guidelines (WCAG) 2.1. 2018. Disponível em: <https://w3.org/TR/WCAG21>. Acesso em: 20 mai. 2026.
WANG, J. et al. Virtual oncology collaborative tumor board using multiple artificial intelligence agents. Journal of Clinical Oncology, v. 43, suppl. 16, p. 1563, 2025. DOI: 10.1200/JCO.2025.43.16_suppl.1563.
WANG, R. et al. AI Agents in Clinical Medicine: A Systematic Review. medrXiv, agosto 2025. Disponível em: <https://medrxiv.org/content/10.1101/2025.08.22.25334232v1>. Acesso em: 20 mai. 2026.


CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO
Evelin Brandão Cordeiro — RM 97814
Pabllo Vinicyus Oliveira Borges de Souza — RM 550124
ANICCA
FASE 4






São Paulo
2026

CENTRO UNIVERSITÁRIO FIAP
BACHARELADO EM SISTEMAS DE INFORMAÇÃO
Evelin Brandão Cordeiro — RM 97814
Pabllo Vinicyus Oliveira Borges de Souza — RM 550124
ANICCA
FASE 4
Atividade do Enterprise Challenge apresentada ao curso de Bacharelado em Sistemas de Informação do Centro Universitário FIAP, como parte das entregas da Fase 4 — Cap. 1: É hora de prototipar.








São Paulo
2026
RESUMO EXECUTIVO
A Anicca — cujo slogan é "Navegando com você na jornada contra o câncer" — é um hub de navegação oncológica conversacional desenvolvido para acompanhar o paciente com câncer em cada aspecto do seu cotidiano: do diagnóstico ao pós-tratamento. Nesta Fase 4, a solução evoluiu da modelagem conceitual para a prototipação e implementação técnica inicial. O presente documento descreve as evoluções realizadas desde a entrega anterior, apresenta o protótipo de alta fidelidade desenvolvido no Figma e o estado atual da implementação técnica — Backend for Frontend (BFF) em FastAPI com Python 3.12, integração WhatsApp via Whatsmiau Cloud v2, orquestração de múltiplos agentes via LangGraph com a API Gemini do Google, banco de dados PostgreSQL com pgvector e cache de sessões em Redis, com o frontend em React Native (Expo SDK 52). O teste de usabilidade foi conduzido por meio de pesquisa indireta em fontes públicas — portais como Oncoguia, Abrale, SciELO, Ministério da Saúde, estudos qualitativos publicados e levantamentos quantitativos — identificando oito perfis de usuários cujos relatos respondem indiretamente às perguntas do formulário de usabilidade. O documento também destaca quatorze funcionalidades com potencial de aprimoramento por inteligência artificial e reflete sobre facilidades, neutralidades e dificuldades da implementação, com ênfase no posicionamento do Anicca como Clinical Decision Support System (CDSS) — sistema de apoio à decisão clínica — que combina reconhecimento de padrões longitudinais, filtragem inteligente por RAG, raciocínio relacional via Knowledge Graph e síntese generativa com LLM.

Palavras-chave: hub conversacional; navegação oncológica; BFF; FastAPI; React Native; LangGraph; WhatsApp; teste de usabilidade; pesquisa indireta; CDSS; XGBoost; pgvector; análise de sentimento; Figma.

LISTA DE FIGURAS
Figura 1 – Arquitetura geral do hub conversacional Anicca (BFF + três perfis + multi-agentes)
Figura 2 – Wireframe: Splash Screen
Figura 3 – Wireframe: Tela de Boas-Vindas e Onboarding
Figura 4 – Wireframe: Login / Cadastro e Questionário Inicial
Figura 5 – Wireframe: Hub Principal (Tela Inicial do Paciente)
Figura 6 – Wireframe: Chat com Ani
Figura 7 – Wireframe: Rotina de Hoje e Meus Documentos
Figura 8 – Wireframe: Body Map Interativo
Figura 9 – Wireframe: Visão do Cuidador (com tasks e recomendações)
Figura 10 – Wireframe: Painel do Médico com IA Clínica



LISTA DE QUADROS
Quadro 1 – Status de implementação por módulo — Fase 4
Quadro 2 – Stack tecnológico — implementação da Fase 4
Quadro 3 – Fases da jornada e ações mapeadas para derivação das tarefas do teste
Quadro 4 – Tarefas do teste de usabilidade derivadas do mapa de jornada
Quadro 5 – Perfis dos participantes do teste de usabilidade indireto
Quadro 6 – Respostas indiretas às perguntas do roteiro de usabilidade
Quadro 7 – Tabulação do teste de usabilidade — eficiência, eficácia e satisfação por participante
Quadro 8 – Funcionalidades priorizadas com inteligência artificial
Quadro 9 – Frameworks e ferramentas por funcionalidade de IA
Quadro 10 – Reflexão sobre implementação — facilidades, neutralidades e dificuldades










LISTA DE ABREVIATURAS E SIGLAS
ABNT — Associação Brasileira de Normas Técnicas
ANVISA — Agência Nacional de Vigilância Sanitária
APAC — Autorização de Procedimento Ambulatorial de Alta Complexidade
API — Application Programming Interface
ASCO — American Society of Clinical Oncology
AWS — Amazon Web Services
BFF — Backend for Frontend
CAAE — Certificado de Apresentação de Apreciação Ética
CACON — Centro de Alta Complexidade em Oncologia
CDSS — Clinical Decision Support System
CEFR — Common European Framework of Reference for Languages
CI/CD — Continuous Integration / Continuous Delivery
CID-10 — Classificação Internacional de Doenças — 10ª Revisão
CNES — Cadastro Nacional de Estabelecimentos de Saúde
CTCAE — Common Terminology Criteria for Adverse Events
FAB — Floating Action Button
FSD — Feature-Sliced Design
GenUI — Generative UI
HRV — Heart Rate Variability
IA — Inteligência Artificial
INCA — Instituto Nacional de Câncer
JAMA — Journal of the American Medical Association
JCO — Journal of Clinical Oncology
JSI — JavaScript Interface
JWT — JSON Web Token
LGPD — Lei Geral de Proteção de Dados Pessoais
LLM — Large Language Model
LSTM — Long Short-Term Memory
ML — Machine Learning
MVP — Minimum Viable Product
MVVM — Model-View-ViewModel
NCCN — National Comprehensive Cancer Network
NCI — National Cancer Institute
NLP — Natural Language Processing
OCR — Optical Character Recognition
PII — Personally Identifiable Information
PRO — Patient-Reported Outcome
RAG — Retrieval-Augmented Generation
RDC — Resolução da Diretoria Colegiada
RNDS — Rede Nacional de Dados em Saúde
RNN — Recurrent Neural Network
RSC — React Server Components
SaMD — Software as a Medical Device
SBOC — Sociedade Brasileira de Oncologia Clínica
SHA — Secure Hash Algorithm
SHAP — SHapley Additive exPlanations
SISREG — Sistema de Regulação
SSR — Server-Side Rendering
SUS — Sistema Único de Saúde
TFD — Tratamento Fora de Domicílio
UFAM — Universidade Federal do Amazonas
UNACON — Unidade de Alta Complexidade em Oncologia
WCAG — Web Content Accessibility Guidelines
XGBoost — Extreme Gradient Boosting











SUMÁRIO
LISTA DE ABREVIATURAS E SIGLAS	6
1 VERSÃO ATUAL DO PROJETO	10
1.1 SOLUÇÃO — O ANICCA	10
1.2 ARQUITETURA DO HUB — BFF E TRÊS PERFIS	11
1.3 WIREFRAMES DAS TELAS PRINCIPAIS	11
1.3.1 Splash Screen	11
1.3.2 Tela de Boas-Vindas e Onboarding	12
1.3.3 Login / Cadastro e Questionário Inicial	13
1.3.4 Hub Principal — Tela Inicial do Paciente	14
1.3.5 Chat com Ani	15
1.3.6 Rotina de Hoje e Meus Documentos	16
1.3.7 Body Map Interativo	17
1.3.8 Visão do Cuidador	18
1.3.9 Painel do Médico com IA Clínica	19
1.4 EVOLUÇÕES IMPLEMENTADAS DESDE A FASE 3	20
2 IMPLEMENTAÇÃO GERAL	22
2.1 LINGUAGENS, FRAMEWORKS E FERRAMENTAS	22
2.2 STATUS DE IMPLEMENTAÇÃO E GITHUB	23
3 TESTE DE USABILIDADE COM PÚBLICO-ALVO	24
3.1 PLANEJAMENTO — TAREFAS E ROTEIRO	24
3.2 EXECUÇÃO — METODOLOGIA DE PESQUISA INDIRETA	25
3.3 PERFIS DOS PARTICIPANTES	25
3.4 TABULAÇÃO E ANÁLISE	26
3.5 CONCLUSÕES E AJUSTES	28
4 DESTAQUE DE FUNCIONALIDADES COM INTELIGÊNCIA ARTIFICIAL	30
4.1 FUNCIONALIDADES IDENTIFICADAS E JUSTIFICATIVAS	30
4.2 O ANICCA COMO SISTEMA DE APOIO À DECISÃO CLÍNICA (CDSS)	32
4.2.1 O dado do paciente como insumo clínico	32
4.2.2 Clinical Decision Support System (CDSS) — definição e posicionamento	32
4.2.3 Tipos de IA envolvidos e visualização pelo usuário	33
4.3 FRAMEWORKS E FERRAMENTAS PARA AS FUNCIONALIDADES DESTACADAS	33
5 REFLEXÃO SOBRE A IMPLEMENTAÇÃO DAS FUNCIONALIDADES EM DESTAQUE	36
5.1 FACILIDADES, NEUTRALIDADES E DIFICULDADES	36
5.2 VISÃO COMPUTACIONAL, MACHINE LEARNING E INTEGRAÇÃO DE ALTA FIDELIDADE	37
5.2.1 Visão Computacional	37
5.2.2 Machine Learning e o pipeline de dados longitudinais do CDSS	37
5.2.3 Integração de Protótipo de Alta Fidelidade com Lógica Simulada de Backend	38

1 VERSÃO ATUAL DO PROJETO 
1.1 SOLUÇÃO — O ANICCA
O Brasil enfrenta uma crise silenciosa na assistência oncológica. O INCA estima 704 mil casos novos por ano no triênio 2023–2025. Ainda que a Lei n.º 12.732/2012 garanta início de tratamento em até 60 dias após o diagnóstico patológico, 73,6% dos pacientes nos dez tipos tumorais com piores indicadores têm essa lei descumprida. Em estados do Norte e Nordeste, a espera pode ultrapassar 634 dias. Além disso, 68% dos pacientes desconhecem seus direitos legais e 44% não conseguem acessá-los.
O problema se desdobra em múltiplas dimensões do cotidiano: desinformação sobre diagnóstico e tratamento; isolamento emocional e social; dificuldade de gestão da rotina diária (medicamentos, sintomas, hidratação, sono); dificuldades financeiras; logística de deslocamento; burocracia do SISREG, APAC e TFD; e ausência de um canal único que acompanhe o paciente de forma contínua. Nenhuma solução digital disponível no Brasil endereça esse conjunto de necessidades de forma integrada.
A Anicca é um hub de navegação oncológica conversacional que integra WhatsApp, web e app em uma experiência unificada, contínua e inteligente. A plataforma opera por meio de Ani, um mascote gato personalizável que guia pacientes, cuidadores e médicos ao longo de toda a jornada oncológica. O agente de IA subjacente é baseado em Large Language Model (LLM) com Retrieval-Augmented Generation (RAG) oncológico, sem emitir diagnóstico ou prescrição — posicionando a Anicca fora do escopo regulatório de Software as a Medical Device (SaMD) da ANVISA (RDC 657/2022). No nível técnico avançado, o Ani opera sobre uma arquitetura de múltiplos agentes especializados via LangGraph, um grafo de conhecimento oncológico (Neo4j + OncoKB) e modelos preditivos treinados com Federated Learning.
A plataforma possui três perfis distintos: paciente, cuidador e médico — este último com painel clínico de decisão apoiado por IA, incluindo comparação com casos similares em bases nacionais e internacionais (guidelines ASCO, SBOC, NCCN, PubMed e OncoKB) por meio de arquitetura de múltiplos agentes. A Anicca também incorpora Body Map interativo para registro de sintomas por região corporal, módulo completo de rotina diária (medicamentos, hidratação, temperatura, sono), journaling emocional contextual gerado pelo LLM com base no estado clínico e emocional do paciente, integração com smartwatches e Federated Learning para treino de modelos de ML em dados hospitalares sem centralização — atendendo à LGPD por design.
1.2 ARQUITETURA DO HUB — BFF E TRÊS PERFIS
O hub adota o padrão arquitetural Backend for Frontend (BFF) — o backend FastAPI é um intermediário dedicado ao frontend que adapta as respostas para cada canal e perfil. O BFF recebe mensagens de qualquer canal via Gateway de Canal unificado, aciona o agente coordenador Ani (LangGraph), que distribui subtarefas para agentes especializados e retorna a resposta formatada: template rich para WhatsApp, card JSON declarativo para app/web (GenUI), texto para voz. A camada de contexto unificado (Redis) persiste estado da conversa, perfil e histórico independentemente do canal.
Os três perfis da plataforma — Paciente, Cuidador e Médico — acessam a mesma interface (app/web) com conteúdo adaptado pelo perfil declarado no onboarding. Não há portais separados: o mesmo código serve todos os perfis. A arquitetura combina três padrões que operam em níveis distintos: Clean Architecture governa o sistema inteiro; Feature-Sliced Design (FSD) organiza as features dentro do frontend em seis camadas hierárquicas; e MVVM via hooks vive dentro da camada de apresentação de cada feature.
Figura 1 – Arquitetura geral do hub conversacional Anicca (BFF + três perfis + multi-agentes)

Fonte: Elaborado pelos autores (2026)
1.3 WIREFRAMES DAS TELAS PRINCIPAIS
Os wireframes foram desenvolvidos no Figma, seguindo as diretrizes de acessibilidade WCAG 2.1 AA, as boas práticas do Conversation Design Institute e o paradigma de Generative UI (GenUI). Todas as telas implementam alternância entre modo guiado pelo Ani e modo autônomo. A fonte Nunito é aplicada em todos os elementos de texto. A seguir são descritas e apresentadas as telas desenvolvidas na Fase 4.
1.3.1 Splash Screen
A Splash Screen é a primeira tela exibida ao abrir o aplicativo. Apresenta o logotipo da Anicca centralizado sobre o fundo na cor primária (#403229), com o mascote Ani em animação Lottie de entrada (ani-wave.json). A tela dura aproximadamente 2,5 segundos e redireciona automaticamente para a Tela de Boas-Vindas (se primeiro acesso) ou para o Hub Principal (se usuário já autenticado). A fonte do nome "Anicca" é Nunito Black (peso 900).
Figura 2 – Wireframe: Splash Screen

Fonte: Elaborado pelos autores (2026)
1.3.2 Tela de Boas-Vindas e Onboarding
A Tela de Boas-Vindas é o ponto de entrada do fluxo de onboarding de 7 etapas. O Ani aparece em destaque com animação Lottie (ani-wave.json), apresentando-se em linguagem CEFR A2. Dois botões principais estruturam a navegação dual: "Vamos começar" (inicia o fluxo guiado) e "Explorar sozinho" (ativa o modo autônomo e leva diretamente ao Hub). A progressão pelas etapas é indicada por uma barra de progresso linear na parte superior. Em cada etapa, o Ani adapta sua fala ao contexto — na Etapa 2, por exemplo, exibe três cards de seleção de perfil (Sou a paciente / Sou o cuidador / Médico ou Enfermeiro). A Etapa 6 apresenta o Termo de Uso em linguagem simplificada com três toggles de consentimento (notificações, câmera, calendário), conforme exigido pela LGPD.
Figura 3 – Wireframe: Tela de Boas-Vindas e Onboarding

Fonte: Elaborado pelos autores (2026)
1.3.3 Login / Cadastro e Questionário Inicial
Após completar o onboarding, o usuário é convidado (mas não obrigado) a criar uma conta — zero-friction: é possível usar a plataforma sem cadastro. A tela de Login/Cadastro oferece acesso via e-mail e senha, ou login social (Google / Apple). CPF não é solicitado nesta tela — apenas no módulo de importação RNDS. Após o cadastro, um questionário inicial de 4 perguntas personaliza a experiência do Ani: tipo de câncer (autocomplete CID-10 simplificado), fase atual do tratamento, modalidade de saúde (SUS/convênio/particular) e personalidade do Ani escolhida. As respostas são salvas no Zustand store de perfil e sincronizadas com o backend via FastAPI.
Figura 4 – Wireframe: Login / Cadastro e Questionário Inicial

Fonte: Elaborado pelos autores (2026)
1.3.4 Hub Principal — Tela Inicial do Paciente
O Hub Principal é a tela de entrada após o login. O cabeçalho exibe o avatar personalizado do usuário, seu nome e o ciclo atual de tratamento. A barra de busca inteligente é o ponto de entrada da GenUI — ao digitar palavras-chave como "dor no estômago" ou "náusea", o sistema renderiza inline os cards declarativos correspondentes (Body Map pré-selecionado, card CTCAE, ou card de medicamento). Abaixo da busca, quatro cards de atalho apresentam: próximo ciclo de tratamento (com countdown), sintomas do dia (carga CTCAE acumulada), último exame laboratorial (tendência de neutrófilos) e status da Lei dos 60 dias (semáforo verde/âmbar/vermelho). A navegação inferior fixa apresenta quatro abas: Hub, Ani, Rotina e Docs. O botão flutuante do Ani (FAB laranja #FF9A5C) está sempre visível para acesso rápido ao chat.
Figura 5 – Wireframe: Hub Principal (Tela Inicial do Paciente)

Fonte: Elaborado pelos autores (2026)
1.3.5 Chat com Ani
A tela de Chat com Ani é o coração conversacional da plataforma. A interface segue o padrão de chat familiar (bolhas de mensagem), com a distinção visual de que as respostas do Ani podem conter cards GenUI declarativos embutidos — por exemplo, ao perguntar sobre sintomas, o Ani retorna um card CTCAE interativo diretamente na conversa. O indicador de digitação (typing indicator) usa a animação Lottie ani-thinking.json. O usuário pode alternar a qualquer momento entre o modo conversacional (chat livre) e o modo autônomo (navegar pelo Hub sem o Ani). O histórico completo da conversa é persistido no Redis (sessão ativa) e no PostgreSQL (histórico de longo prazo), garantindo continuidade entre sessões e canais (WhatsApp ↔ app ↔ web). Sugestões de ação rápida (quick replies) são exibidas abaixo das respostas do Ani para facilitar a navegação sem digitação.
Figura 6 – Wireframe: Chat com Ani

Fonte: Elaborado pelos autores (2026)
1.3.6 Rotina de Hoje e Meus Documentos
A tela de Rotina de Hoje organiza o acompanhamento diário do paciente em cinco blocos em rolagem vertical. Bloco 1 — Temperatura: campo de entrada numérica; se ≥37,8°C, exibe banner educacional laranja com orientação para contato com o plantão oncológico (posicionado como informação de suporte, não triagem automática, em conformidade com as recomendações IDSA/ASCO). Bloco 2 — Medicamentos: listagem por período (manhã/tarde/noite) com marcação por toque e contador de adesão diária. Bloco 3 — Hidratação: oito copos interativos com mensagem educativa sobre hidratação durante a quimioterapia. Bloco 4 — Sono: campo de registro de duração e qualidade subjetiva (escala 1–5 com emoji), integrado automaticamente com dados do smartwatch via Google Health Connect quando disponível. Bloco 5 — CTA de Sintomas: botão destacado de acesso rápido ao Body Map e à escala CTCAE.
A tela de Meus Documentos funciona como uma central inteligente de gestão documental do paciente oncológico. Toda documentação médica recebida por qualquer canal — foto enviada via WhatsApp, upload direto no app ou digitalização pela câmera — é automaticamente processada pelo Agente Documentos via OCR (AWS Textract) e catalogada sem intervenção manual do usuário.
A interface organiza os documentos em sete categorias colapsáveis, exibidas como accordion: Hemograma e Exames Laboratoriais, Imagem (TC/RM/PET-Scan), Patologia e Biópsia, Consultas e Relatórios Médicos, Prescrições, Plano de Saúde e Seguro, e SUS/INSS/RNDS. Cada categoria exibe o número de documentos armazenados e a data do mais recente. Ao expandir uma categoria, os documentos aparecem em cards individuais contendo: badge de origem (WhatsApp, câmera, upload), data de recebimento, nome do arquivo e um destaque gerado por IA com a informação mais relevante daquele documento — por exemplo, em um hemograma, o destaque pode exibir "Neutrófilos 980 — abaixo do valor de referência" ou "PSA 4,2 — estável em relação à coleta anterior".
Uma barra de busca por palavra-chave no topo da tela permite localizar qualquer documento por termo clínico, data ou tipo de exame. O botão de câmera flutuante (FAB) permite capturar e enviar um novo documento diretamente da tela, acionando o fluxo de OCR e catalogação automática. Documentos podem ser compartilhados individualmente com o médico vinculado com um único toque, gerando um registro de compartilhamento no log de auditoria.
Figura 7 – Wireframe: Rotina de Hoje e Meus Documentos

Fonte: Elaborado pelos autores (2026)
1.3.7 Body Map Interativo
O Body Map é implementado como silhueta SVG interativa com visões frontal e dorsal do corpo humano. Na visão do paciente, o toque em qualquer região anatômica abre um modal de registro com: escala de intensidade deslizante (0–10), seleção do tipo de sintoma (dor, dormência, inchaço, vermelhidão, ferida, outro) e campo de texto livre para descrição. Após o registro, a região é colorida com intensidade proporcional ao nível informado (gradiente de amarelo a vermelho), e o histórico temporal é acessível por linha do tempo por região. Na visão do médico (painel clínico), o Body Map exibe os registros acumulados do paciente ao longo do tempo, com filtro por período e tipo de sintoma, e permite inserção de anotações clínicas privadas por região anatômica.
Figura 8 – Wireframe: Body Map Interativo

Fonte: Elaborado pelos autores (2026)
1.3.8 Visão do Cuidador
A visão do cuidador é acessada mediante consentimento explícito do paciente (badge de permissão visível em todos os dados). O dashboard do cuidador apresenta, além das informações padrão da visão do paciente (timeline da jornada, próximas consultas, Body Map de sintomas, chamados abertos), dois blocos exclusivos que diferenciam esta visão: Tasks — lista de tarefas contextuais geradas pelo Ani com base no estado clínico do paciente vinculado (exemplo: "Rosa tem consulta amanhã — lembrar de levar os laudos", "Neutrófilos baixos esta semana — verificar temperatura hoje"); e Recomendações — sugestões personalizadas do Ani dirigidas ao cuidador para apoio emocional e logístico (exemplo: "Esta semana é a mais pesada do Ciclo 3 para Rosa — considere organizar as refeições com antecedência"). O alerta de risco de abandono (badge ML verde/amarelo/vermelho) é exibido de forma proeminente para orientar a atenção do cuidador.
Figura 9 – Wireframe: Visão do Cuidador (com tasks e recomendações)

Fonte: Elaborado pelos autores (2026)
1.3.9 Painel do Médico com IA Clínica
O painel do médico é acessado via portal web (apps/web-doctor) com credenciais distintas, protegidas por JWT com claim role: "doctor" e validação de vínculo paciente-médico no banco de dados. A tela principal lista os pacientes vinculados com: iniciais, tipo de câncer, ciclo atual, último registro CTCAE e score de risco de abandono (badge colorido gerado pelo modelo ML XGBoost + SHAP: verde/amarelo/vermelho). Ao selecionar um paciente, o médico acessa: Body Map temporal com histórico de sintomas por região e filtro por data; evolução CTCAE em gráfico de linha; briefing pré-consulta gerado automaticamente pelo Agente Briefing (resumo do últimos 30 dias de PROs, exames pendentes, chamados abertos, aderência a medicamentos); documentos compartilhados; e mensagens seguras criptografadas com log de auditoria. O campo de consulta livre de IA clínica aciona simultaneamente os Agentes PubMed, Guidelines, OncoKB e ClinicalTrials, retornando síntese com citação rastreável à fonte primária por recomendação.
Figura 10 – Wireframe: Painel do Médico com IA Clínica

Fonte: Elaborado pelos autores (2026)

1.4 EVOLUÇÕES IMPLEMENTADAS DESDE A FASE 3
A Fase 4 concentrou-se na transição da modelagem conceitual para a prototipação e implementação técnica inicial. As principais evoluções cobrem três frentes: (a) construção da fundação técnica do sistema — monorepo, BFF, banco de dados e cache de sessão; (b) integração dos canais conversacionais — WhatsApp via Whatsmiau Cloud v2 e orquestração de agentes via LangGraph; e (c) design das interfaces em alta fidelidade no Figma.
Quadro 1 – Status de implementação por módulo — Fase 4
Componente / Módulo
Status e descrição
Monorepo Turborepo + pnpm workspaces
Estrutura criada com packages/ compartilhados (types, ui, config). Expo SDK 52 detecta automaticamente o monorepo.
BFF FastAPI (Python 3.12)
Operacional. Endpoints de webhook WhatsApp, autenticação JWT, roteamento de perfis (paciente/cuidador/médico) e integração com Redis.
Integração WhatsApp (Whatsmiau Cloud v2)
Webhooks ativos em sandbox. Recebimento e envio de mensagens de texto, botões e listas funcionando.
LangGraph + Gemini API
Grafo de agentes v1 implementado: Agente Supervisor (Ani), Agente RAG Oncológico e Agente Documentos. Respostas em tempo real via streaming.
PostgreSQL + pgvector + Alembic
Banco provisionado. Migrations iniciais rodando. Esquema de Paciente, Jornada, Sintoma e EntradaJournaling criado.
Redis (contexto conversacional)
Cache de sessão por conversa ativo. Persistência do histórico entre turnos e canais (WhatsApp ↔ app).
React Native (Expo SDK 52)
App inicializado com Expo Router v4 e NativeWind v4. Telas de Splash, Onboarding e Hub Principal em refinamento visual.
Wireframes Figma (alta fidelidade)
10 telas concluídas: Splash, Boas-Vindas, Onboarding (7 etapas), Login/Cadastro, Hub Principal, Chat Ani, Rotina de Hoje, Meus Documentos, Body Map, Visão do Cuidador e Painel do Médico.
GitHub
Repositório público: https://github.com/evamyuu/anicca com estrutura monorepo documentada.

Fonte: Elaborado pelos autores (2026)
As integrações complementares — OCR de laudos (AWS Textract), Body Map interativo com histórico temporal, Google Health Connect, modelagem relacional no Neo4j e Federated Learning — estão planejadas para as Fases 5 e 6, conforme o cronograma estabelecido.
2 IMPLEMENTAÇÃO GERAL
2.1 LINGUAGENS, FRAMEWORKS E FERRAMENTAS
A solução Anicca é uma aplicação multiplataforma que cobre mobile (iOS e Android), web e WhatsApp num único hub conversacional com BFF dedicado. A escolha por React Native com Expo SDK 52 — em vez de desenvolvimento nativo separado com Kotlin/Swift — é justificada pela necessidade de sincronismo entre plataformas, pelo suporte à New Architecture (Fabric + JSI) que elimina a ponte JS ↔ nativo e pela detecção automática de monorepo pelo Expo. O backend em Python com FastAPI foi escolhido pelo ecossistema ML robusto e pela performance assíncrona nativa, essencial para o streaming de respostas do LLM.
O protótipo foi desenvolvido diretamente em alta fidelidade no Figma, integrando design e código em paralelo, com tokens de design (paleta de cores, tipografia Nunito, espaçamentos e componentes reutilizáveis) referenciados diretamente no NativeWind v4 do app e no Tailwind do portal web. A paleta do modo claro é baseada em tons quentes: primária #403229 (marrom profundo), secundária #FF9A5C (laranja Ani). O modo escuro segue estilo Windows — fundo #0F0F0F, superfície #1A1A1A.
Quadro 2 – Stack tecnológico — implementação da Fase 4
Camada
Tecnologia
Justificativa
Monorepo
Turborepo + pnpm workspaces
Cache de build; tasks paralelas; compatível com Expo SDK 52.
Frontend Mobile
React Native (Expo SDK 52)
Multiplataforma iOS/Android; New Architecture (Fabric+JSI); Expo Router v4.
Frontend Web
Next.js 14 (App Router)
RSC para SSR; Server Actions; streaming de respostas LLM.
UI Components
NativeWind v4 + shadcn/ui
Tailwind CSS unificado mobile/web; WCAG 2.1 AA.
Estado Servidor
React Query v5 (TanStack)
Cache automático; refetch; loading/error padronizados.
Estado Global
Zustand
Store leve; perfil, mascote, preferências, sessão.
Backend API / BFF
Python 3.12 / FastAPI
Async nativo; Pydantic v2; ecossistema ML/IA.
Orquestração Agentes
LangGraph (LangChain v1.0)
Grafo de estados multi-agente com auditabilidade e streaming.
LLM / IA
Gemini API (Google)
Modelo gemini-2.5-flash; streaming nativo; multi-agente.
RAG / Vector DB
LangChain + pgvector
Embeddings text-embedding-3-small (OpenAI); busca semântica.
OCR de Laudos
AWS Textract (Fase 5)
Precisão para docs médicos; extração estruturada de texto.
WhatsApp
Whatsmiau Cloud v2
Gratuita até 1.000 conversas/mês; webhooks; Evolution API.
Banco de Dados
PostgreSQL 16 (AWS RDS)
Relacional + pgvector; pgcrypto para dados sensíveis.
Cache / Sessão
Redis 7 (AWS ElastiCache)
Contexto conversacional entre turnos e canais.
CI/CD
GitHub Actions + Docker
Pipelines de teste, lint e deploy automatizados.
Tipografia
Nunito (Google Fonts)
Rounded, empática, acessível — exclusiva do Anicca.
Linguagem
TypeScript (strict) + Python 3.12
Tipagem estrita; JSDoc obrigatório por arquivo.
Cloud
AWS São Paulo (sa-east-1)
Residência de dados no Brasil (LGPD).

Fonte: Elaborado pelos autores (2026)
2.2 STATUS DE IMPLEMENTAÇÃO E GITHUB
Nesta fase, toda a base técnica saiu do papel. O BFF FastAPI está operacional com endpoints de webhook WhatsApp. A integração com a Whatsmiau Cloud v2 está ativa em sandbox, com recebimento e envio de mensagens testados. O grafo LangGraph está rodando com a API do Gemini em tempo real, entregando respostas dos Agentes Supervisor, RAG Oncológico e Documentos. O banco PostgreSQL com pgvector está provisionado e as migrations estão rodando via Alembic. O frontend React Native está inicializado com Expo Router v4 e as telas estão em refinamento visual. O código está disponível em: https://github.com/evamyuu/anicca.
A observação importante para o planejamento é que o protótipo funcional de alta fidelidade com todas as integrações estará completo na Fase 5 (agosto/2026), incluindo OCR de laudos, Body Map interativo com histórico e Knowledge Graph Neo4j. A Fase 6 (setembro/2026) contempla testes de usabilidade diretos com usuários reais, ajustes de UX e demonstração ao vivo na banca Claro/FIAP.
3 TESTE DE USABILIDADE COM PÚBLICO-ALVO
3.1 PLANEJAMENTO — TAREFAS E ROTEIRO
O teste de usabilidade da Fase 4 foi estruturado a partir do mapa de jornada do usuário — metodologia recomendada para derivar tarefas realistas e representativas do uso real do produto. O mapa de jornada da Anicca foi construído com base na persona principal Rosa Silva (52 anos, paciente de câncer de mama estágio II, SUS, Caruaru/PE) e cobre as fases de pré-tratamento, tratamento ativo e acompanhamento contínuo.
Quadro 3 – Fases da jornada e ações mapeadas para derivação das tarefas do teste
Fase da Jornada
Ação principal
Descrição da ação no app
Pré-tratamento
Receber o diagnóstico
Fotografar laudo pelo WhatsApp, receber tradução da IA em linguagem leiga e lista de perguntas para o médico.
Pré-tratamento
Conhecer direitos no SUS
Consultar a Lei dos 60 dias, ver semáforo de prazo e abrir ticket preventivo se necessário.
Durante o tratamento
Registrar sintomas do dia
Marcar sintoma no Body Map, ver classificação CTCAE e receber orientação educacional contextualizada.
Durante o tratamento
Gerenciar rotina diária
Registrar temperatura, marcar medicamentos tomados, registrar hidratação e sono.
Continuamente
Journaling emocional
Responder check-in diário às 21h, escrever livremente no diário privado e receber sugestão contextual da IA.

Fonte: Elaborado pelos autores (2026)
Das cinco ações mapeadas, foram selecionadas as três com maior impacto na proposta de valor core do Anicca — as que respondem diretamente às barreiras de desinformação, isolamento e fragmentação identificadas no problema. Essas três ações foram transformadas nas tarefas do roteiro de teste.
Quadro 4 – Tarefas do teste de usabilidade derivadas do mapa de jornada
Tarefa
Descrição
Funcionalidade testada
Critério de avaliação
T1
Enviar foto de laudo pelo WhatsApp e verificar a tradução gerada pela IA em linguagem acessível
Funcionalidade de OCR + RAG Oncológico — core do módulo de documentos
Eficiência de acesso à informação clínica; redução de barreiras linguísticas
T2
Acessar a tela de Hub Principal e registrar um sintoma no Body Map com localização e intensidade
Funcionalidade de Body Map SVG interativo — core do módulo de sintomas
Eficácia do registro espacial; intuitividade da silhueta tocável
T3
Verificar os direitos legais pelo módulo de Direitos e abrir um ticket para a ouvidoria do SUS
Funcionalidade de RAG de direitos + módulo de chamados — core da navegação oncológica
Completude da tarefa; satisfação com a clareza da linguagem CEFR A2

Fonte: Elaborado pelos autores (2026)
O roteiro de teste segue a estrutura início–meio–fim recomendada pela metodologia de pesquisa de usuário. No início, o facilitador apresenta o contexto: "Você é Rosa Silva, 52 anos, acabou de receber um diagnóstico de câncer de mama e está tentando entender o que fazer. Abra o Anicca e explore a solução para cada situação apresentada." No meio, o participante realiza as três tarefas sequencialmente, enquanto o observador anota erros, dúvidas e dificuldades sem interromper. No fim, o participante responde a perguntas abertas sobre satisfação geral, pontos de maior clareza e sugestões de melhoria.
3.2 EXECUÇÃO — METODOLOGIA DE PESQUISA INDIRETA
A execução do teste de usabilidade adotou metodologia de pesquisa indireta — abordagem reconhecida em User Research quando o recrutamento presencial de participantes representativos não é viável no prazo da entrega. A pesquisa indireta consiste em identificar e analisar relatos públicos de pessoas que compõem o público-alvo, publicados em fontes confiáveis, cujas declarações respondam às mesmas perguntas que o roteiro de teste endereçaria.
As fontes consultadas incluem: Instituto Oncoguia, Abrale, Ministério da Saúde, Correio Braziliense, SciELO Brasil (Cadernos de Saúde Pública, Revista Brasileira de Enfermagem), Revista Saúde em Redes (Redeunida), Ludomedia/NTQR (estudos qualitativos de enfermagem publicados em 2021), Revista Brasileira de Saúde Suplementar (RBSS) e OncoCenter Médicos. Complementarmente, foram utilizados dados quantitativos do DataSenado (2019), da plataforma Wellon (2024, base de 4,7 milhões de atendimentos) e do ensaio clínico de Basch et al. publicado no JAMA (2017).
3.3 PERFIS DOS PARTICIPANTES
Quadro 5 – Perfis dos participantes do teste de usabilidade indireto
Código
Participante / Perfil
Fonte
Dor principal expressa
U1 — Paciente
Neuza Rodrigues de Ávila, 64 anos, linfoma não-Hodgkin, SUS
Revista Online Abrale
Descontinuidade do tratamento, falta de informação sobre direitos e ausência de canal centralizado.
U2 — Paciente
Luiz, câncer de próstata, Distrito Federal, SUS
Correio Braziliense (jun/2023)
Quatro tentativas de retorno sem sucesso; sensação de abandono pós-cirurgia sem canal de acompanhamento.
U3 — Paciente
Antônia Josimar de Oliveira, 57 anos, câncer de mama, RJ, SUS
Ministério da Saúde (out/2025)
Choque emocional no diagnóstico, fila do regulador; necessidade urgente de acolhimento e orientação clara.
U4 — Cuidadoras
Grupo 'Poderosas Amigas da Mama' — mulheres pós-mastectomia, Baixada Fluminense
Estudo qualitativo, Revista Saúde em Redes (Redeunida)
Criação espontânea de grupo WhatsApp para apoio mútuo — valida canal e demanda por suporte contínuo.
U5 — Cuidadores
Cuidadores familiares identificados em estudos de sobrecarga (n diverso)
SciELO/REBEn + síntese NSaúde
46% sem tempo para consultas próprias; 61% com necessidade de apoio mental; sobrecarga de coordenação.
U6 — Médico
Dra. Alessandra Menezes Morelle (idealizadora do app Thummi)
OncoCenter Médicos (entrevista publicada)
Defende canal estruturado; aponta que WhatsApp 'cru' é insuficiente, validando necessidade de ferramenta dedicada.
U7 — Enfermeiros/Pacientes
Pacientes colorretais + enfermeiros navegadores, São Paulo
Estudo qualitativo, Ludomedia/NTQR (Almeida & Vieira, 2021)
Pacientes sugeriram WhatsApp Business e conteúdo digital confiável como ferramenta de comunicação com a equipe.
U8 — Síntese de Jornada
Estudo 'Jornada do Paciente Oncológico na Saúde Suplementar' (DparaE, CAAE 74923823.6.0000.5121)
Revista Brasileira de Saúde Suplementar
Fragmentação do cuidado, burocracia, falhas de comunicação e falta de suporte emocional: +50h de entrevistas.

Fonte: Levantamento de fontes públicas realizado pelos autores (2026)
3.4 TABULAÇÃO E ANÁLISE
A análise das fontes foi organizada em dois quadros complementares. O Quadro 5 mapeia a correspondência entre cada pergunta do roteiro e os usuários indiretos que a respondem, com o padrão observado e a síntese da evidência. O Quadro 6 aplica os critérios clássicos de usabilidade — eficiência, eficácia e satisfação — inferindo as métricas a partir dos comportamentos e declarações registrados nas fontes.
Quadro 6 – Respostas indiretas às perguntas do roteiro de usabilidade
Pergunta
Tema
Usuários
Síntese da evidência
P1
Interesse em app de jornada oncológica
U1, U2, U3, U8
Existência e adoção de apps como WeCancer/Cecí, Thummi e APPonco comprova demanda; relatos validam necessidade de acompanhamento contínuo desde o diagnóstico.
P2
Uso de WhatsApp para informações de saúde
U4, U6, U7
WhatsApp responde por 89,57% dos contatos com instituições de saúde (Wellon, 2024); 79% dos brasileiros o usam como fonte de informação (DataSenado, 2019). Almeida & Vieira (2021) confirmam que pacientes sugeriram o canal proativamente.
P3
Dificuldade de entender laudos/termos técnicos
U3, U8
Choque no diagnóstico por linguagem inacessível. Paciente do estudo de Almeida & Vieira (2021) solicitou explicitamente: 'simplifica para o paciente, tira esse viés científico'. Oncoguia e INCA mantêm glossários oncológicos pela mesma razão.
P4
Falta de canal único (documentos + lembretes + comunicação)
U1, U2, U5
Informações espalhadas; recomendações clínicas atuais são manuais (fichário, calendário). Cuidadores acumulam a coordenação: medicação, agendamentos, sintomas.
P5
Painel da jornada em tempo real para cuidador/médico
U5, U6, U7
WeCancer já oferece painel clínico com alertas de efeitos adversos graves. Dra. Morelle e enfermeiros navegadores confirmam a demanda; U7 aponta que os próprios pacientes sugeriram a ferramenta.
P6
Perdido sobre direitos no SUS
U1, U2, U3
Estudo SciELO (ASCOMCER, n=62, 91,9% SUS): apenas 62,9% conheciam ao menos um direito; maioria dos direitos individuais conhecida por menos de 10% dos pacientes. Oncoguia lançou Manual dos Direitos da Pessoa com Câncer por essa razão.
P7
IA conversacional empática no dia a dia
U3, U7, U8
Projeto PsiVirtual (UFAM) e Woebot mostram demanda crescente. Ressalvas de psicólogos sobre sigilo e empatia simulada (Revista Visão Hospitalar) orientam o design ético do Ani com disclaimers explícitos e supervisão humana.
P8
Registro de sintomas — como faz hoje
U5, U7
Hoje é manual ou inexistente. Ensaio Basch et al. (JAMA 2017, n=766): sobrevida global 5 meses maior no grupo com automonitoramento digital de sintomas (31,2 vs 26,0 meses, HR=0,832, p=0,03).

Fonte: Levantamento de fontes públicas realizado pelos autores (2026)

Quadro 7 – Tabulação do teste de usabilidade — eficiência, eficácia e satisfação por participante
Participante
Eficácia (consegue realizar a tarefa?)
Eficiência (facilidade/aprendizado)
Satisfação (expectativa expressa)
U1 (Paciente)
Descontinuidade do tratamento evidenciada; necessidade de canal de acompanhamento contínuo confirmada
Alta: buscou ativamente canais de informação e comunicação
Frustração com sistema fragmentado — alta propensão a adotar ferramenta que centralize a jornada
U2 (Paciente)
Quatro tentativas de retorno sem resposta — necessidade de canal rastreável e proativo confirmada
Alta: tentou múltiplos canais disponíveis sem sucesso
Insatisfação extrema com sistema atual — alta propensão a adotar alternativa digital
U3 (Paciente)
Necessidade de tradução do diagnóstico em linguagem acessível e acolhimento no momento do choque emocional
Alta: buscou informação ativamente no diagnóstico
Choque emocional = momento de maior abertura a suporte digital de acolhimento
U4 (Cuidadoras)
Canal WhatsApp criado espontaneamente para suporte mútuo — demanda por ferramenta estruturada confirmada
Alta: adesão voluntária ao canal informal sem nenhuma friction
Satisfação com suporte entre pares — disposição para ferramenta com matching inteligente
U5 (Cuidadores)
Sobrecarga de coordenação documentada; 61% com necessidade de apoio mental confirmados
Alta: cuidadores buscam ativamente organização e suporte
Alta motivação para ferramentas que centralizem tarefas e ofereçam suporte emocional
U6 (Médico)
Demanda por canal estruturado e seguro — WhatsApp cru insuficiente — validada pelo próprio oncologista
Alta: criou própria solução (app Thummi) pela ausência de ferramenta adequada
Satisfação com ferramenta que resolva comunicação médico-paciente com rastreabilidade
U7 (Enfermeiros)
Pacientes sugeriram proativamente WhatsApp Business e conteúdo digital confiável (Almeida & Vieira, 2021)
Alta: iniciativa partiu dos usuários, não da equipe de saúde
Alta abertura para ferramenta estruturada que centralize comunicação e informação
U8 (Síntese)
Fragmentação do cuidado e falta de suporte emocional identificados como principais dores sistêmicas
Alta: estudo com +50h de entrevistas confirma padrão sistêmico de demanda
Alta propensão à adoção de ferramenta que enderece fragmentação e apoio emocional

Fonte: Análise elaborada pelos autores com base nas fontes levantadas (2026)
3.5 CONCLUSÕES E AJUSTES
Os resultados do teste de usabilidade indireto confirmam, de forma convergente, que existe público real e demanda comprovada para todas as funcionalidades core do Anicca. As três lacunas mais críticas e menos atendidas pelos apps existentes são: (a) tradução de laudos em linguagem acessível; (b) centralização de documentos, lembretes e comunicação num único canal; e (c) orientação contextualizada sobre direitos no SUS — com apenas 62,9% dos pacientes conhecendo ao menos um de seus direitos legais.
O estudo de Almeida e Vieira (2021), realizado com pacientes em tratamento para câncer colorretal no Hospital Israelita Albert Einstein, identificou que os pacientes valorizam especialmente: comunicação quase instantânea com a equipe, conteúdo atualizado e fidedigno e linguagem simplificada — exatamente o que o Ani entrega via WhatsApp e app. A ressalva importante do mesmo estudo — de que em alguns casos o interesse pelo app não foi significativo, com causas relacionadas ao cansaço do cotidiano e falta de tempo — orienta diretamente o design do Anicca: o WhatsApp como canal de entrada principal reduz a fricção de acesso; as quick replies e os cards GenUI eliminam a necessidade de digitação; e o protocolo de silêncio respeita o ritmo do paciente em vez de aumentar a sobrecarga com notificações.
Os principais ajustes derivados do teste são: (1) priorizar o módulo de tradução de laudos no MVP; (2) fortalecer o módulo de direitos com linguagem CEFR A2 e simulador da Lei dos 60 dias; (3) manter o WhatsApp como canal de entrada principal; (4) posicionar o registro de sintomas como recurso clínico com comunicação do benefício de sobrevida; (5) tratar a IA empática com disclaimers explícitos de limites e supervisão humana; (6) para o teste direto (Fase 6), recrutar via Oncoguia, Abrale e grupos de WhatsApp de pacientes oncológicos.
4 DESTAQUE DE FUNCIONALIDADES COM INTELIGÊNCIA ARTIFICIAL
4.1 FUNCIONALIDADES IDENTIFICADAS E JUSTIFICATIVAS
A identificação das funcionalidades com maior potencial de aprimoramento por IA parte de dois eixos complementares: (a) as dores validadas pelo teste de usabilidade da Seção 3, que apontam onde o impacto no usuário é maior; e (b) a análise de concorrentes e gaps de mercado, que mapeia onde as soluções existentes têm lacunas que a arquitetura multi-agente do Anicca resolve de forma diferenciada. O Quadro 7 apresenta as quatorze funcionalidades identificadas, com suas justificativas.
Quadro 8 – Funcionalidades priorizadas com inteligência artificial
Funcionalidade
Como a IA aprimora
Fase
Justificativa (dor validada)
FAQ Dinâmico por Perfil Clínico
O LLM gera, com base no CID-10 + estágio do paciente, uma lista curada das dúvidas mais frequentes para aquele perfil — exibida como cards na tela do Hub. Diferente do chat livre, é curadoria proativa.
MVP (Fase 5)
Paciente E2 em Almeida & Vieira (2021) sugeriu explicitamente um FAQ por tipo de tumor e estágio. Filtragem inteligente visível diretamente na tela inicial.
Comunidade entre Pares (Matching por IA)
Matching entre pacientes por similaridade de perfil (CID-10, estágio, fase, localização) via embeddings. Moderação automática de linguagem de sofrimento antes da entrega das mensagens.
Fase 5 (roadmap)
Grupos como 'Poderosas Amigas da Mama' surgem espontaneamente pela ausência de canal estruturado. Matching por IA resolve o gap sem expor dados clínicos entre pares.
Matching de Ensaios Clínicos (Paciente)
Filtragem automática em ClinicalTrials.gov por CID-10 + estágio + localização do paciente, com cards que traduzem critérios técnicos em linguagem CEFR A2.
Fase 5
User research confirma que pacientes buscam ativamente tratamentos alternativos mas a barreira é a linguagem técnica dos critérios de inclusão e exclusão.
Protocolo de Silêncio (ML + NLP)
Quando o modelo ML detecta 12+ dias sem acesso combinado com queda de sentimento no journaling, o Ani envia UMA mensagem empática e entra em modo silêncio. Zero notificações adicionais.
MVP (Fase 5)
Resposta direta ao gap de dropout identificado em Almeida & Vieira (2021): cansaço e sobrecarga cognitiva são as principais razões de abandono de apps de saúde.
Análise de Sentimento no Journaling (NLP)
Camada NLP que classifica o estado emocional (positivo/neutro/sofrimento leve/sofrimento intenso) a partir das entradas de journaling, alimentando o modelo preditivo e o protocolo de silêncio.
MVP (Fase 5)
Transforma texto não estruturado do paciente em sinal clínico estruturado — conecta o dado subjetivo ao CDSS do médico e ao modelo preditivo.
Geolocalização de CACONs/UNACONs
Integração com CNES/DATASUS (tipo 36 = oncologia) com filtragem geoespacial que calcula distância do paciente ao estabelecimento e indica elegibilidade TFD (>50 km). Mapa interativo no app.
MVP (Fase 5)
Barreira geográfica é uma das principais barreiras à navegação oncológica no SUS. Para pacientes do Norte/Nordeste — onde a espera pode ultrapassar 634 dias — é funcionalidade crítica.
Personalidade Adaptativa do Ani
O LLM adapta tom, vocabulário e abordagem emocional baseado na persona escolhida no onboarding + no estado clínico atual. Adaptação visível em cada mensagem.
MVP (Fase 4–5)
Personalização por IA é fator-chave de alta adesão em apps oncológicos (JCO CCI, 2024). A persona é variável do system prompt que calibra empatia, tecnicidade e proatividade.
Briefing Pré-Consulta Automático
Resume automaticamente os últimos 30 dias de PROs: sintomas CTCAE, aderência a medicamentos, variação de humor, exames pendentes, chamados abertos e dados de wearable. Entregue ao médico sem ação manual.
MVP (Fase 5)
É geração de texto com reconhecimento de padrões temporais que resolve o gap de informação longitudinal — nenhum prontuário clínico convencional captura esses dados de forma estruturada.
Tradução de Laudos (RAG + OCR)
Agente Documentos usa AWS Textract para extrair o texto do laudo e o Agente RAG para traduzir termos técnicos em linguagem CEFR A2, gerando três perguntas para o oncologista.
MVP (Fase 5)
Dor mais crítica: 68% dos pacientes não conhecem seus direitos e chegam ao tratamento sem entender o diagnóstico. Funcionalidade com maior impacto e menor risco regulatório.
Journaling Emocional Contextual
O LLM gera prompts de journaling personalizados com base no estado clínico (ciclo de quimio, sintomas, aderência) e no histórico emocional (check-ins anteriores). Prompt único, não genérico.
MVP (Fase 4–5)
Ensaio Basch et al. (JCO 2016) demonstrou melhora de qualidade de vida e redução de visitas ao pronto-socorro com monitoramento digital de PROs. Journaling contextual amplifica esse efeito.
Classificação CTCAE de Sintomas
Agente CTCAE classifica os sintomas registrados nos graus 0–4 do NCI CTCAE v5.0, exibindo informação educacional contextualizada. Grau 4 aciona banner com orientação de contato com plantão.
MVP (Fase 5)
Padronização clínica internacional para comunicação de efeitos adversos. Uso no app evita ambiguidade e aumenta valor dos dados para o médico.
Predição de Risco de Abandono (XGBoost)
Modelo XGBoost com SHAP para interpretabilidade, treinado com features de jornada (frequência de acesso, variação de humor, aderência a medicamentos, frequência de registro de sintomas).
Fase 5
Abandono do tratamento oncológico é causa crítica de mortalidade. SHAP garante rastreabilidade — requisito para uso clínico responsável.
Busca Semântica em Documentos (pgvector)
Embeddings indexam o conteúdo processado pelo OCR. A busca por palavra-chave em Meus Documentos retorna os documentos mais semanticamente próximos, não apenas os que contêm a palavra exata.
MVP (Fase 5)
Pacientes oncológicos acumulam dezenas de documentos. A busca semântica é a única forma viável de navegar nesse volume sem organização manual.
IA Clínica Multi-Agente (CDSS — Médico)
Agentes PubMed, Guidelines, OncoKB e ClinicalTrials acionados em paralelo via LangGraph. O Agente Supervisor sintetiza com citação rastreável à fonte primária por recomendação.
MVP (Fase 5)
Wang et al. (JCO 2025) demonstra que sistemas multi-agente superam LLMs isolados em tarefas clínicas complexas. Microsoft Healthcare Agent Orchestrator (Azure AI Foundry, mai/2025) confirma maturidade.

Fonte: Elaborado pelos autores (2026)
4.2 O ANICCA COMO SISTEMA DE APOIO À DECISÃO CLÍNICA (CDSS)
4.2.1 O dado do paciente como insumo clínico
O diferencial mais profundo do Anicca não está em nenhuma funcionalidade isolada — está no que acontece quando todas elas operam juntas ao longo do tempo. Cada interação do paciente com a plataforma gera um dado estruturado que, individualmente, tem valor limitado. Mas ao longo de semanas e ciclos de tratamento, esses dados se acumulam numa representação longitudinal da jornada clínica que nenhum médico conseguiria obter de outra forma numa consulta de 20 minutos: sintomas registrados diariamente no Body Map com localização anatômica, intensidade e timestamp; humor documentado no journaling emocional, correlacionável com os ciclos de quimioterapia; aderência real a medicamentos — não o que o paciente declara na consulta, mas o que efetivamente marcou dia a dia; dados de sono e HRV do smartwatch; temperatura registrada durante o período de neutropenia; e laudos catalogados com OCR, pesquisáveis semanticamente via pgvector.
Quando o médico abre o painel clínico antes de uma consulta, ele acessa um briefing gerado automaticamente que cruza esses dados longitudinais com literatura científica contextualizada para aquele paciente específico. A IA associa padrões entre os dados do paciente e a evidência científica de milhares de casos documentados na literatura — algo que vai além do que qualquer médico conseguiria realizar individualmente numa consulta de tempo limitado.
4.2.2 Clinical Decision Support System (CDSS) — definição e posicionamento
O conjunto de funcionalidades que alimentam o painel do médico no Anicca configura, do ponto de vista técnico, um Clinical Decision Support System (CDSS). A definição de Sim et al. (2001) descreve CDSS como qualquer sistema computacional que relaciona características individuais do paciente a uma base de conhecimento clínico e apresenta ao médico recomendações que apoiam a tomada de decisão. O Anicca atende exatamente essa definição: cruza o perfil longitudinal do paciente com bases de conhecimento oncológico (PubMed, ASCO, NCCN, OncoKB, ClinicalTrials.gov) e entrega recomendações com citação rastreável à fonte primária.
É fundamental distinguir o Anicca de um sistema de diagnóstico automático. O CDSS do Anicca opera no modelo de augmented intelligence (inteligência aumentada), não de inteligência autônoma: (a) a IA não emite diagnóstico nem prescrição; (b) a decisão clínica é sempre e exclusivamente do médico; (c) toda recomendação exibe a fonte primária com link; e (d) o sistema é transparente por design — não é uma caixa-preta, mas um assistente de pesquisa acelerado que faz em segundos o que um residente faria em horas pesquisando no PubMed. Esse posicionamento mantém o Anicca fora do escopo regulatório de Software as a Medical Device (SaMD) da ANVISA (RDC 657/2022).
4.2.3 Tipos de IA envolvidos e visualização pelo usuário
O CDSS do Anicca combina quatro tipos distintos de inteligência artificial. O Reconhecimento de Padrões Longitudinais (XGBoost + SHAP) identifica nas séries temporais de dados do paciente padrões que antecipam deterioração clínica ou abandono do tratamento. A Filtragem Inteligente e RAG Clínico (pgvector + agentes PubMed/Guidelines) filtra, de entre milhares de artigos e protocolos, os mais relevantes para o perfil específico daquele paciente naquele momento. O Raciocínio Relacional via Knowledge Graph (Neo4j) conecta entidades clínicas — CID-10, protocolos, variantes genômicas OncoKB, efeitos adversos CTCAE — permitindo navegar relações não lineares. E a Síntese Generativa com LLM (Gemini API) sintetiza as saídas dos agentes especializados numa resposta coerente, contextualizada e com citação rastreável.
Do ponto de vista da visualização pelo usuário, o CDSS se manifesta concretamente no painel do médico: o briefing pré-consulta em linguagem natural; o Body Map temporal com filtro por período; o gráfico de linha CTCAE da evolução de efeitos adversos; o badge de risco de abandono (verde/amarelo/vermelho); e o campo de consulta livre que retorna a síntese dos agentes com hiperlinks para cada fonte primária.
4.3 FRAMEWORKS E FERRAMENTAS PARA AS FUNCIONALIDADES DESTACADAS
Quadro 9 – Frameworks e ferramentas por funcionalidade de IA
Funcionalidade
Tecnologias específicas
Papel de cada tecnologia
FAQ Dinâmico
Gemini API; pgvector (FAQs similares); PostgreSQL (base por CID-10 + estágio); React Native (cards GenUI)
LLM gera FAQs por perfil; pgvector busca perguntas similares via similaridade de cosseno para evitar duplicatas; cards renderizados como componentes declarativos na tela Hub.
Comunidade entre Pares
sentence-transformers; pgvector (similaridade de cosseno); FastAPI (endpoint de matching); Gemini API (moderação)
Embeddings do perfil público são comparados por similaridade de cosseno no pgvector; o Gemini modera mensagens antes da entrega; dados clínicos não são compartilhados entre pares.
Matching Ensaios Clínicos
ClinicalTrials.gov REST API; Gemini API (tradução CEFR A2); LangGraph (Agente ClinicalTrials); React Native (cards)
Agente filtra por CID-10 + estágio + localização; Gemini traduz critérios técnicos; cards exibidos diretamente na interface do paciente.
Protocolo de Silêncio
XGBoost (score de risco); Gemini API (análise de sentimento); Redis (inatividade); Whatsmiau v2 (mensagem única); Celery (scheduler)
Celery verifica diariamente score de risco + inatividade no Redis; FastAPI aciona Whatsmiau para mensagem única; evento registrado no log de auditoria.
Análise de Sentimento
Gemini API (classificação em português); PostgreSQL (histórico de sentimentos); FastAPI (pipeline); LangGraph (integração com modelo de risco)
Cada entrada de journaling é processada pelo Gemini imediatamente; score armazenado como feature temporal; LangGraph conecta ao Agente de Risco de Abandono.
Geolocalização CACONs
CNES/DATASUS API (tipo 36); Google Maps SDK; React Native (mapa); FastAPI (elegibilidade TFD); PostgreSQL (cache)
FastAPI calcula distância via Google Maps; filtra por tipo de serviço; elegibilidade TFD calculada automaticamente e exibida como badge no card.
Personalidade Adaptativa
Gemini API (system prompt dinâmico); Zustand (store de persona + estado clínico); Redis (contexto de sessão); FastAPI
Persona + estado clínico injetados no system prompt a cada turno; Zustand mantém a persona sincronizada entre sessões e canais.
Briefing Pré-Consulta
LangGraph (Agente Briefing); Gemini API (síntese clínica); PostgreSQL (PROs 30 dias); FastAPI; React Native / Next.js
Agente acionado automaticamente 24h antes de cada consulta; LangGraph coleta PROs do PostgreSQL; Gemini sintetiza em narrativa clínica estruturada.
Tradução de Laudos
AWS Textract (boto3); LangChain + pgvector; Gemini API (síntese CEFR A2); FastAPI; Whatsmiau v2
Textract extrai texto do PDF/imagem; embeddings indexam o conteúdo; Gemini traduz e gera perguntas para o médico; resultado enviado via WhatsApp e arquivado.
Journaling Contextual
Gemini API; Redis (contexto de sessão); PostgreSQL (histórico de entradas); LangGraph (Agente Journaling)
LangGraph mantém estado do agente entre turnos; Redis persiste contexto de sessão; PostgreSQL armazena entradas criptografadas com pgcrypto.
Classificação CTCAE
Python (NCI CTCAE v5.0 indexado como JSON); LangGraph (Agente CTCAE); React Native (cards CTCAE com emoji)
Índice CTCAE em JSON consultado pelo agente para classificar o grau com precisão; frontend renderiza cards como componentes GenUI declarativos.
Predição de Abandono
Scikit-learn + XGBoost; SHAP; PostgreSQL (features tabulares); FastAPI (endpoint de score)
XGBoost com SHAP para interpretabilidade; features extraídas do PostgreSQL; score exposto via endpoint FastAPI e consumido pelo painel do médico.
Busca Semântica
pgvector (PostgreSQL extension); sentence-transformers; LangChain (VectorStore); FastAPI
Embeddings gerados no upload do documento; consulta via similaridade de cosseno; resultado retornado ordenado por relevância semântica.
IA Clínica Multi-Agente
LangGraph (grafo multi-agente); Gemini API (síntese); NCBI E-utilities; OncoKB REST API; ClinicalTrials.gov API; PDFs indexados com pgvector
LangGraph orquestra agentes em paralelo; cada agente acessa apenas suas APIs (Trust Layer); Supervisor sintetiza e retorna com citação rastreável à fonte primária.

Fonte: Elaborado pelos autores (2026)
5 REFLEXÃO SOBRE A IMPLEMENTAÇÃO DAS FUNCIONALIDADES EM DESTAQUE
5.1 FACILIDADES, NEUTRALIDADES E DIFICULDADES
Quadro 10 – Reflexão sobre implementação — facilidades, neutralidades e dificuldades
Dimensão
Componente
Descrição
FACILIDADES
Ecossistema Python/LangChain para IA
A integração entre FastAPI, LangGraph, pgvector e a Gemini API se mostrou fluida. A API do Gemini suporta streaming nativo, o que simplificou a implementação do typing indicator do Ani no app.
FACILIDADES
PostgreSQL + pgvector para RAG
A extensão pgvector elimina a necessidade de um banco vetorial separado no MVP, reduzindo custos operacionais e complexidade de infraestrutura. A integração com Alembic facilita o controle de versão do esquema.
FACILIDADES
Whatsmiau Cloud v2 para WhatsApp
API baseada no protocolo Evolution API tem documentação clara e suporte a webhooks configurável. A implementação do canal de entrada principal levou menos tempo do que o previsto.
NEUTRALIDADES
React Native com Expo SDK 52
A New Architecture (Fabric + JSI) melhora a performance, mas ainda há incompatibilidades de algumas bibliotecas nativas, exigindo fallback pontual para o modo legado — débito técnico controlado.
NEUTRALIDADES
Tipagem estrita TypeScript no monorepo
O overhead de configurar paths de importação entre packages do monorepo consumiu mais tempo do que o esperado, mas o investimento se paga à medida que o código escala.
DIFICULDADES
Latência do LLM no ambiente de desenvolvimento
A latência das chamadas à Gemini API pode ultrapassar 3–4 segundos para respostas com múltiplos agentes. A implementação de streaming parcial e cache no Redis mitiga na experiência do usuário final.
DIFICULDADES
LGPD e dados sensíveis de saúde
A pseudonimização (SHA-256 com salt), o pgcrypto para dados em repouso e o audit log sem PII exigiram revisão cuidadosa de cada endpoint. O risco de vazamento de dados sensíveis em logs (Sentry) exigiu middleware custom de sanitização.
DIFICULDADES
Onboarding vs. coleta de dados mínimos
Existe tensão entre o zero-friction onboarding (uso sem cadastro) e a necessidade de coletar dados suficientes para personalizar o Ani. Solução: questionário inicial de 4 perguntas com valores padrão quando não preenchido.
DIFICULDADES
Orquestração paralela de agentes com latência aceitável
O painel do médico aciona quatro agentes simultaneamente. Em testes iniciais, a síntese completa pode levar 8–15 segundos sem streaming. A solução foi o streaming progressivo via LangGraph — o médico recebe os primeiros resultados enquanto os demais agentes ainda processam.
DIFICULDADES
Rastreabilidade de citações no CDSS (alucinação do LLM)
O maior risco de um CDSS baseado em LLM num contexto clínico é a alucinação. O Anicca mitiga por arquitetura: cada agente busca em fontes estruturadas (NCBI, OncoKB REST API, ClinicalTrials.gov) e retorna conteúdo recuperado; o Supervisor sintetiza apenas o que foi buscado, não gera citações de memória.
DIFICULDADES
Cold start do modelo preditivo sem dados reais
O modelo XGBoost enfrenta cold start: sem dados reais em volume suficiente, o treinamento inicial é feito com dados sintéticos baseados na literatura sobre abandono de tratamento oncológico. O badge de risco exibe a indicação de que o modelo ainda está em calibração inicial.

Fonte: Elaborado pelos autores (2026)
5.2 VISÃO COMPUTACIONAL, MACHINE LEARNING E INTEGRAÇÃO DE ALTA FIDELIDADE
5.2.1 Visão Computacional
O Anicca incorpora visão computacional em duas frentes. A principal é o módulo de OCR de laudos, implementado com AWS Textract — uma solução baseada em deep learning especializada no reconhecimento de texto em documentos complexos, como PDFs médicos, imagens de laudos e tabelas de hemograma. Do ponto de vista técnico, o OCR opera sobre a representação digital da imagem como uma função bidimensional f(x,y) de intensidade luminosa: o Textract aplica redes convolucionais que identificam padrões visuais locais (bordas, caracteres, linhas) usando operações similares às de filtragem espacial estudadas — como filtros passa-alta para realce de bordas e operações morfológicas para isolamento de regiões de texto. O resultado é a extração estruturada do conteúdo, que o Agente RAG então processa para traduzir em linguagem acessível.
5.2.2 Machine Learning e o pipeline de dados longitudinais do CDSS
O componente de Machine Learning do Anicca não opera de forma isolada — ele é o que transforma os dados longitudinais coletados pelo paciente em inteligência clínica acionável para o médico. Esse é o núcleo do posicionamento do Anicca como CDSS: o paciente alimenta o sistema continuamente, e esses dados se tornam as features do modelo preditivo que o médico consulta no painel. Sem o engajamento do paciente, não há dados longitudinais; sem os dados longitudinais, o modelo não tem capacidade analítica superior à de uma avaliação pontual.
O Anicca implementa ML supervisionado (classificação) no modelo de predição de risco de abandono, usando XGBoost com SHAP para interpretabilidade. As features tabulares incluem: frequência de acesso ao app (diária, semanal), variação de humor no journaling (delta entre check-ins — análogo a uma derivada discreta da série temporal de sentimentos), aderência a medicamentos (percentual de doses marcadas), frequência de registro de sintomas e dias desde o último contato ativo. O modelo é treinado inicialmente com dados sintéticos balanceados, usando técnicas de regularização para evitar overfitting, e atualizado progressivamente com dados reais consentidos. O uso do SHAP para interpretar as predições garante explicabilidade — cada predição é acompanhada de quais features mais contribuíram para o score — requisito ético e regulatório para uso clínico responsável.
O modelo é projetado para ser conservador — priorizando sensibilidade (detectar todos os casos de alto risco, mesmo que gere alguns falsos positivos) em vez de especificidade, pois um falso negativo num contexto oncológico pode resultar em ausência de intervenção num momento crítico. O médico e o cuidador são sempre o filtro humano final: o badge de risco é um alerta, nunca uma decisão autônoma do sistema.
A camada de análise de sentimento no journaling usa o Gemini API para classificar as entradas de texto em português, identificando padrões que antecipam sofrimento intenso. Essa camada é conceitualmente análoga às redes recorrentes (RNN/LSTM) que processam sequências de texto em ordem temporal — o modelo leva em conta não apenas a entrada atual, mas o histórico de check-ins anteriores (a "memória" da série temporal de humor do paciente). O resultado alimenta tanto o modelo preditivo de abandono quanto o protocolo de silêncio.
5.2.3 Integração de Protótipo de Alta Fidelidade com Lógica Simulada de Backend
A integração entre o protótipo de alta fidelidade e a lógica de backend está em andamento ativo nesta fase. O BFF FastAPI já expõe endpoints reais — não simulados — para: recebimento de mensagens WhatsApp, envio de respostas do Ani via streaming, registro de perfil de usuário e armazenamento de entradas de journaling. O frontend React Native consome esses endpoints via React Query v5, com estados de loading e erro padronizados.
A lógica simulada está presente apenas nos módulos que ainda aguardam integrações externas: o Body Map usa dados mockados; o módulo de OCR usa textos de laudos hardcoded; e o módulo de Rotina de Hoje usa lembretes estáticos. Essa arquitetura de mocks facilita o desenvolvimento paralelo de frontend e backend sem dependência de APIs externas e será progressivamente substituída por integrações reais nas Fases 5 e 6.

REFERÊNCIAS
ALMEIDA, F. A.; VIEIRA, M. M. Propondo uma ferramenta tecnológica para comunicação entre enfermeiro e paciente em oncologia. Investigação Qualitativa em Saúde: Avanços e Desafios, v. 8, p. 478-486, 2021. DOI: 10.36367/ntqr.8.2021.478-486.
ARDITO, V. et al. Evaluating Barriers and Facilitators to the Uptake of mHealth Apps in Cancer Care Using the Consolidated Framework for Implementation Research: Scoping Literature Review. JMIR Cancer, v. 9, p. e42092, 2023. DOI: 10.2196/42092.
BASCH, E. et al. Overall survival results of a trial assessing patient-reported outcomes for symptom monitoring during routine cancer treatment. JAMA, v. 318, n. 2, p. 197-198, 2017. DOI: 10.1001/jama.2017.7156.
BASCH, E. et al. Symptom monitoring with patient-reported outcomes during routine cancer treatment: a randomized controlled trial. Journal of Clinical Oncology, v. 34, n. 6, p. 557-565, 2016. DOI: 10.1200/JCO.2015.63.0830.
BRASIL. Lei n.º 12.732, de 22 de novembro de 2012. Brasília: Presidência da República, 2012.
BRASIL. Lei n.º 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília: Presidência da República, 2018.
BRASIL. Ministério da Saúde. 'O câncer de mama tentou me derrubar, mas a rede pública salvou a minha vida'. out/2025. Disponível em: <https://www.gov.br/saude>. Acesso em: 10 jun. 2026.
CORREIO BRAZILIENSE. Pacientes com câncer levam até 6 meses para consulta na rede pública. jun. 2023. Disponível em: <https://www.correiobraziliense.com.br>. Acesso em: 10 jun. 2026.
DATASÊNADO. Pesquisa sobre uso do WhatsApp como fonte de informação. Brasília: Agência Brasil / EBC, dez. 2019. Disponível em: <https://agenciabrasil.ebc.com.br>. Acesso em: 10 jun. 2026.
FEATURE-SLICED DESIGN. Frontend Architecture Methodology. 2024. Disponível em: <https://feature-sliced.design>. Acesso em: 10 jun. 2026.
FREEMAN, H. P.; RODRIGUEZ, R. L. History and principles of patient navigation. Cancer, v. 117, n. 15 supl., p. 3539-3542, 2011. DOI: 10.1002/cncr.26262.
INCA — INSTITUTO NACIONAL DE CÂNCER. Estimativa 2023: incidência de câncer no Brasil. Revista Brasileira de Cancerologia, v. 69, n. 1, p. e-213700, 2023.
INSTITUTO ONCOGUIA. Instituto Oncoguia lança Manual dos Direitos da Pessoa com Câncer. Disponível em: <https://www.oncoguia.org.br>. Acesso em: 10 jun. 2026.
LANGCHAIN. LangGraph Documentation. 2025. Disponível em: <https://langchain-ai.github.io/langgraph/>. Acesso em: 10 jun. 2026.
MICROSOFT. Developing next-generation cancer care management with multi-agent orchestration. Microsoft Industry Blog, maio 2025.
NATIONAL CANCER INSTITUTE (NCI). Common Terminology Criteria for Adverse Events (CTCAE), Version 5.0. 2017. Disponível em: <https://ctep.cancer.gov>.
ONCOGUIA — INSTITUTO. Desafios enfrentados pelo paciente com câncer atendido pelo SUS. Disponível em: <https://oncoguia.org.br>. Acesso em: 10 jun. 2026.
PRESIDENT'S CANCER PANEL. Enhancing Patient Navigation with Technology to Improve Equity in Cancer Care. Bethesda: NCI, 2024.
REVISTA BRASILEIRA DE SAÚDE SUPLEMENTAR (RBSS). Jornada do Paciente Oncológico na Saúde Suplementar Brasileira. Disponível em: <https://rbss.org.br>. Acesso em: 10 jun. 2026.
REVISTA SAÚDE EM REDES (REDEUNIDA). Poderosas Amigas da Mama: o uso do aplicativo WhatsApp como ferramenta para o enfrentamento do câncer de mama. Disponível em: <https://revista.redeunida.org.br>. Acesso em: 10 jun. 2026.
SCIELO — CADERNOS DE SAÚDE PÚBLICA. As informações sobre os direitos sociais estão acessíveis aos pacientes oncológicos? Disponível em: <http://www.scielo.br/j/csp>. Acesso em: 10 jun. 2026.
SCIELO — REVISTA BRASILEIRA DE ENFERMAGEM. Apoio social à família do paciente com câncer. Disponível em: <https://www.scielo.br/j/reben>. Acesso em: 10 jun. 2026.
VERCEL. Turborepo Documentation. 2025. Disponível em: <https://turbo.build/repo/docs>. Acesso em: 10 jun. 2026.
WANG, J. et al. Virtual oncology collaborative tumor board using multiple artificial intelligence agents. Journal of Clinical Oncology, v. 43, suppl. 16, p. 1563, 2025. DOI: 10.1200/JCO.2025.43.16_suppl.1563.
WANG, R. et al. AI Agents in Clinical Medicine: A Systematic Review. medrXiv, agosto 2025. Disponível em: <https://medrxiv.org>. Acesso em: 10 jun. 2026.
WELLON. Relatório de Atendimento em Saúde via WhatsApp: base de 4,7 milhões de atendimentos (jan–out 2024). São Paulo: Wellon, 2024.
WHATSMIAU CLOUD. Whatsmiau Cloud API Documentation v2. 2026. Disponível em: <https://whatsmiau.dev/docs>. Acesso em: 10 jun. 2026.




