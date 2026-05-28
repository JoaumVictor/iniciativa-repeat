# Backend Dev

## Prisma na pasta api

O Prisma foi configurado como ferramenta auxiliar de desenvolvimento para:

- introspectar o schema atual do Postgres/Supabase
- abrir o Prisma Studio
- gerar cliente para scripts Node futuros

Neste projeto, o Prisma nao substitui o Supabase SQL. O arquivo api/supabase_init.sql continua sendo a fonte de verdade para:

- RLS
- triggers
- functions / RPCs
- buckets e policies de storage
- qualquer recurso especifico do Supabase

## Variaveis necessarias

Preencha no .env da raiz:

- DATABASE_URL: pooler do Supabase com ?pgbouncer=true
- DIRECT_URL: conexao direta do banco ou session pooler na porta 5432

## Comandos Prisma

- npm run prisma:db:pull
- npm run prisma:generate
- npm run prisma:format
- npm run prisma:studio

Fluxo sugerido:

1. Atualize o banco via api/supabase_init.sql ou Supabase CLI.
2. Rode npm run prisma:db:pull.
3. Rode npm run prisma:generate.
4. Use npm run prisma:studio para inspecionar dados.

## Supabase CLI

A documentacao oficial recomenda instalar como dependencia de desenvolvimento ou usar npx.

Comandos adicionados no projeto:

- npm run supabase:init
- npm run supabase:start
- npm run supabase:stop
- npm run supabase:status
- npm run supabase:db:push
- npm run supabase:db:reset
- npm run supabase:functions:serve
- npm run supabase -- functions new nome-da-function

Fluxo sugerido da CLI:

1. npm run supabase:init
2. npm run supabase:start
3. npm run supabase:db:push
4. npm run supabase -- functions new hello-world
5. npm run supabase:functions:serve

O config local do Supabase ja aponta para ../api/supabase_init.sql como schema principal.

Observacao importante:

Supabase Edge Functions rodam em Deno. Para functions, prefira supabase-js, fetch ou libs compativeis com Deno. Prisma Client Node nao e a escolha certa dentro dessas functions.
