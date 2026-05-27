# INICIATIVA REPEAT - current task

Status: fase 3 iniciada
Prioridade: backend Supabase primeiro, front depois, chaves por ultimo

## Objetivo do produto

Criar um aplicativo de musculacao e social para amigos, inspirado em redes de treino, com:

- login com Google via Supabase Auth
- conta de usuario vinculada ao auth do Supabase
- criacao e entrada em parties
- feed principal com posts das parties em que o usuario participa
- interacoes de rede social: like, deslike, comentario
- perfil com dados fisicos, esteticos e de evolucao
- customizacao visual por party
- publicacao de posts com imagem e texto

## Principios do projeto

- Supabase e a fonte de verdade do backend
- Nao usar dados sensiveis hardcoded
- Primeiro desenhar schema, regras, funcoes e policies
- Depois conectar a camada `api/` do app
- Depois montar telas e fluxo visual
- As chaves de ambiente entram por ultimo

## Ordem de execucao

### Fase 1 - Backend Supabase

1. Definir modelo de dados completo
2. Definir enums, relacoes e restricoes
3. Definir RLS e regras de acesso
4. Definir triggers para perfil, contadores e streak
5. Definir storage buckets e politicas
6. Definir SQL de seed inicial e helpers
7. Definir funcoes RPC se necessario

Entregas ja iniciadas:

- schema inicial do Supabase registrado em `api/supabase_init.sql`
- regras de negocio detalhadas registradas em `api/supabase_business_rules.md`

### Fase 2 - Camada `api/`

1. Criar client Supabase
2. Criar tipos compartilhados
3. Criar queries e actions por dominio
4. Criar regras de cache e invalidacao
5. Criar serviços de auth e upload

Entregas ja iniciadas:

- client Supabase registrado em `src/api/supabaseClient.ts`
- contratos e tipos do backend registrados em `src/types/supabase.ts`
- serviços de auth, profiles, parties, posts, feed e storage registrados em `src/api/`

### Fase 3 - Frontend

1. Login com Google
2. Onboarding / vinculacao da conta
3. Feed principal
4. Criacao de post
5. Tela de party
6. Tela de perfil
7. Configuracoes e customizacoes

Entregas ja iniciadas:

- login com Google preparado em `app/(auth)/login.tsx`
- feed inicial preparado em `app/(app)/index.tsx`
- fluxo de post preparado em `app/(app)/post.tsx`
- tela de perfil preparada em `app/(app)/profile.tsx`
- tela de parties preparada em `app/(app)/party.tsx`

### Fase 4 - Refinos

1. Validacoes
2. Estados vazios
3. Upload de imagens
4. Reacoes em tempo real
5. Performance e experiencia

## Entregas esperadas na fase de backend

- schema SQL pronto para migracao
- policies de RLS descritas e implementaveis
- funcoes para criar perfil e atualizar streak
- tabela de parties, membros, posts, reacoes e comentarios
- storage para avatar, banner e anexos de post
- contrato claro para a camada de app

## Regras de negocio principais

- O login acontece com Google no Supabase Auth
- Todo usuario autenticado possui um perfil em `profiles`
- Uma party e um grupo fechado de membros
- Apenas membros veem o feed da party
- Post pertence a uma party e a um autor
- Like e deslike sao exclusivos entre si por usuario e post
- Comentarios pertencem a um post e a um autor
- O usuario pode favoritar parties
- O usuario edita apenas o proprio perfil
- O owner ou admin da party gerencia membros e customizacoes
- O streak do usuario depende de check-in diario

## Checklist de definicao

- [ ] schema final aprovado
- [ ] regras de acesso aprovadas
- [ ] funcoes/triggers aprovadas
- [ ] storage definido
- [ ] tipos do app alinhados ao backend
- [ ] chaves de ambiente adicionadas por ultimo

## Proximo passo imediato

Desenhar e registrar as regras de negocio completas do Supabase na pasta `api/`, com tabelas, enums, policies, triggers e storage.
