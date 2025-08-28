
Olá! Preciso que você implemente um sistema de rastreamento de funil de marketing em um projeto Next.js. O objetivo é enviar webhooks para o N8N em etapas cruciais da jornada do usuário: a primeira visita e cada passo de um quiz.

A implementação deve ser robusta, organizada e seguir as melhores práticas, separando a lógica do cliente e do servidor adequadamente.

Aqui está o detalhamento completo do que precisa ser feito:

---

### **Requisito 1: Identificação Única e Persistente do Usuário**

**Objetivo:** Rastrear um usuário de forma anônima ao longo de toda a sua jornada, mesmo que ele feche e reabra o navegador.

**Implementação Técnica:**
1.  Crie um componente de rastreamento (`N8NTracker.tsx`) que será incluído no `RootLayout`.
2.  Dentro deste componente, use um `useEffect` para verificar se existe um cookie chamado `my_session_id`.
3.  Se o cookie **não existir**, gere um UUID (Universally Unique Identifier) e salve-o em um cookie chamado `my_session_id` com validade de 30 dias.
4.  Este `external_id` (o valor do cookie) deve ser a chave primária para identificar o usuário em todos os webhooks subsequentes.

---

### **Requisito 2: Captura e Armazenamento de Parâmetros de Campanha (UTMs)**

**Objetivo:** Saber qual anúncio ou campanha trouxe o usuário, para que essa informação possa ser associada a todos os eventos de conversão.

**Implementação Técnica:**
1.  No mesmo componente `N8NTracker.tsx`, quando a página carregar, verifique a URL em busca dos seguintes parâmetros: `utm_source`, `utm_medium`, e `utm_campaign`.
2.  Se algum desses parâmetros existir, salve-os como um objeto JSON no `localStorage` do navegador, sob a chave `campaign_params`.
3.  Este objeto salvo deve ser recuperado e incluído no webhook de `HomePageView`.

---

### **Requisito 3: Webhook de Visita na Página Inicial (HomePageView)**

**Objetivo:** Rastrear cada usuário que chega à página inicial (`/`).

**Implementação Técnica:**
1.  Crie uma **Server Action** em um arquivo `src/app/actions.ts`. Esta ação, chamada `trackHomePageView`, será responsável por enviar o webhook. Isso é crucial para ocultar a URL do webhook do lado do cliente.
2.  O `N8NTracker.tsx` deve chamar esta Server Action **apenas** se o `pathname` atual for `/`.
3.  O payload do webhook deve ser um JSON contendo:
    *   `eventName`: "HomePageView"
    *   `eventTime`: Timestamp atual.
    *   `userData`: Objeto com `external_id`, `fbc`, `fbp` (se existirem nos cookies) e `client_user_agent`.
    *   `customData`: Objeto com `ad_id` (de `utm_source`), `adset_id` (de `utm_medium`), `campaign_id` (de `utm_campaign`).
    *   `event_source_url`: A URL completa da página.
    *   `action_source`: "website"
4.  **URL do Webhook:** `[SUA_URL_PAGINA_INICIAL_AQUI]`

---

### **Requisito 4: Webhook para Cada Etapa do Quiz**

**Objetivo:** Rastrear o progresso do usuário em cada pergunta do quiz para identificar pontos de abandono.

**Implementação Técnica:**
1.  Na página do quiz (`src/app/quiz/page.tsx`), crie uma função `sendQuizStepEvent`.
2.  Esta função deve ser chamada sempre que uma resposta for enviada (seja por clique em opção de avanço automático ou clique no botão "Continuar").
3.  A chamada deve ser feita via `fetch` diretamente do lado do cliente. É importante usar `keepalive: true` na chamada `fetch` para garantir que a requisição seja enviada mesmo que o usuário navegue para a próxima página rapidamente.
4.  O payload do webhook deve ser um JSON simples contendo:
    *   `external_id`: O ID do cookie.
    *   `quiz_step`: O número da pergunta atual.
    *   `quiz_question`: O texto da pergunta.
    *   `quiz_answer`: A resposta fornecida pelo usuário.
5.  **URL do Webhook:** `[SUA_URL_QUIZ_AQUI]`

---

Por favor, implemente este sistema nos arquivos correspondentes. Obrigado!
