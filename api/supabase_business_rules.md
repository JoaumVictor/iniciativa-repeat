# Supabase business rules - Iniciativa Repeat

Este documento define o contrato de backend que deve ser implementado no Supabase antes da camada visual.

## Escopo

- Autenticacao com Google
- Vinculacao entre `auth.users` e `public.profiles`
- Parties privadas com feed social interno
- Posts com imagem, texto, likes, dislikes e comentarios
- Favoritos de party
- Check-in diario e streak
- Personalizacao visual por party
- Uploads de avatar, banner e midia de post

## Entidades principais

### 1) auth.users

Responsabilidade:

- armazenar credenciais e identidade do Supabase Auth
- suportar login com Google

Regra:

- nenhum dado de negocio pesado deve ficar apenas em `auth.users`
- ao criar um usuario auth, deve ser criado um perfil correspondente em `profiles`

### 2) profiles

Responsabilidade:

- representar o usuario dentro do app

Campos sugeridos:

- id uuid primary key references `auth.users.id`
- email text
- username text
- full_name text
- nickname text
- bio text
- avatar_url text
- banner_url text
- gender text ou enum
- birth_date date
- height_cm numeric
- weight_kg numeric
- biceps_cm numeric
- chest_cm numeric
- waist_cm numeric
- thigh_cm numeric
- neck_cm numeric
- goal_status enum: `bulking`, `cutting`, `maintenance`, `recomp`, `other`
- streak_days integer default 0
- last_checkin_at timestamptz
- created_at timestamptz
- updated_at timestamptz

Regras:

- o email vem da autenticação
- o usuario pode editar apenas o proprio perfil
- `streak_days` e `last_checkin_at` devem ser atualizados por trigger ou funcao controlada

### 3) parties

Responsabilidade:

- agrupar usuarios em comunidades fechadas

Campos sugeridos:

- id uuid primary key
- owner_id uuid references `profiles.id`
- name text
- description text
- avatar_url text
- banner_url text
- theme_background_color text
- post_card_color text
- is_private boolean default true
- invite_code text unique
- created_at timestamptz
- updated_at timestamptz

Regras:

- toda party tem um owner
- apenas membros podem ver o feed
- o owner pode editar configuracoes visuais da party
- `invite_code` pode ser usado para entrada controlada
- uma RPC de entrada por codigo pode registrar o usuario como membro ativo

### 4) party_members

Responsabilidade:

- mapear membros de cada party

Campos sugeridos:

- id uuid primary key
- party_id uuid references `parties.id`
- user_id uuid references `profiles.id`
- role enum: `owner`, `admin`, `member`
- status enum: `active`, `pending`, `blocked`, `left`
- joined_at timestamptz
- created_at timestamptz

Regras:

- um usuario pode participar de varias parties
- deve existir unicidade por `party_id + user_id`
- apenas membros ativos podem interagir no feed da party
- owner e admin podem gerenciar membros

### 5) party_favorites

Responsabilidade:

- permitir favoritar uma party

Campos sugeridos:

- id uuid primary key
- party_id uuid references `parties.id`
- user_id uuid references `profiles.id`
- created_at timestamptz

Regras:

- um usuario pode favoritar a mesma party apenas uma vez
- favorito e uma relacao do usuario, nao da party

### 6) posts

Responsabilidade:

- publicar conteudo dentro de uma party

Campos sugeridos:

- id uuid primary key
- party_id uuid references `parties.id`
- author_id uuid references `profiles.id`
- text_content text
- image_url text
- like_count integer default 0
- dislike_count integer default 0
- comment_count integer default 0
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz

Regras:

- post pertence a uma party especifica
- apenas membros da party podem postar e ver o post
- autor pode editar ou apagar o proprio post
- owner/admin da party pode moderar
- contadores devem ser derivados de reacoes e comentarios, de preferencia por trigger

### 7) post_reactions

Responsabilidade:

- registrar like ou dislike por usuario em um post

Campos sugeridos:

- id uuid primary key
- post_id uuid references `posts.id`
- user_id uuid references `profiles.id`
- reaction enum: `like`, `dislike`
- created_at timestamptz
- updated_at timestamptz

Regras:

- um usuario so pode ter uma reacao ativa por post
- like e dislike sao mutuamente exclusivos
- trocar de like para dislike substitui a reacao anterior
- reagir a post exige ser membro ativo da party do post

### 8) comments

Responsabilidade:

- armazenar comentarios em posts

Campos sugeridos:

- id uuid primary key
- post_id uuid references `posts.id`
- author_id uuid references `profiles.id`
- parent_comment_id uuid nullable references `comments.id`
- content text
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz

Regras:

- comentario pertence a um post
- autor pode editar ou apagar o proprio comentario
- respostas em thread sao opcionais, via `parent_comment_id`
- comentar exige ser membro da party do post

### 9) checkins

Responsabilidade:

- registrar presenca diaria do usuario no app

Campos sugeridos:

- id uuid primary key
- user_id uuid references `profiles.id`
- checkin_date date
- note text
- created_at timestamptz

Regras:

- apenas um check-in por usuario por dia
- check-in serve para atualizar streak
- o streak nao deve ser editado manualmente na tela comum

### 10) storage

Buckets sugeridos:

- profile-avatars
- profile-banners
- party-avatars
- party-banners
- post-media

Regras:

- imagens de perfil e banner do usuario ficam separadas das parties
- anexos de post devem entrar em bucket especifico para midia social
- acesso publico ou privado deve ser definido por tipo de asset
- a ownership de storage deve usar `owner_id` como referencia principal

## Regras de acesso e visibilidade

### Profiles

- leitura: usuario autenticado pode consultar perfis conforme necessidade da rede
- escrita: somente o proprio usuario
- alteracoes sensiveis devem passar por auth do Supabase

### Parties

- leitura: somente membros ativos, exceto convites/publicidade eventual se no futuro isso for permitido
- escrita: owner e admins
- entrada: por convite, codigo ou fluxo de aprovacao

### Posts

- leitura: apenas membros ativos da party
- escrita: membros ativos
- moderacao: owner e admin

### Reactions

- leitura: membros da party
- escrita: usuario autenticado que seja membro da party

### Comments

- leitura: membros da party
- escrita: usuario autenticado que seja membro da party

### Favorites

- leitura e escrita: somente o proprio usuario

### Checkins

- leitura: usuario e, se desejado, visibilidade agregada para party
- escrita: somente o proprio usuario

## RLS sugerido

Ativar RLS em todas as tabelas publicas do dominio.

Politicas base:

- `profiles`: select autenticado; update apenas self
- `parties`: select apenas membro; insert autenticado; update owner/admin; delete owner
- `party_members`: select membros da party; insert por owner/admin ou por self com convite; update owner/admin; delete owner/admin ou self ao sair
- `party_favorites`: select/insert/delete apenas self
- `posts`: select membros; insert membros; update/delete autor ou admin
- `post_reactions`: select membros; insert/update/delete membros
- `comments`: select membros; insert membros; update/delete autor ou admin
- `checkins`: select apenas self; insert self; update nenhum ou controlado por trigger

## Triggers e funcoes necessarias

### 1) create_profile_on_auth_user

Objetivo:

- criar automaticamente uma linha em `profiles` quando um usuario auth nasce

Entradas esperadas:

- id do usuario auth
- email
- nome se vier do provedor Google

### 2) update_timestamps

Objetivo:

- atualizar `updated_at` em tabelas relevantes

Tabelas:

- profiles
- parties
- posts
- comments
- post_reactions

### 3) sync_post_reaction_counts

Objetivo:

- manter `like_count` e `dislike_count` consistentes

Comportamento:

- insert em like incrementa like_count
- insert em dislike incrementa dislike_count
- troca de reacao atualiza ambos os contadores
- delete reduz o contador correspondente

### 4) sync_comment_count

Objetivo:

- manter `comment_count` consistente no post

### 5) update_checkin_streak

Objetivo:

- calcular streak ao inserir check-in

Regra sugerida:

- se o check-in for no dia seguinte ao ultimo, incrementa streak
- se houver quebra de um ou mais dias, reseta para 1
- se o check-in for no mesmo dia, bloqueia duplicidade

### 6) maybe_generate_invite_code

Objetivo:

- gerar codigo unico da party quando nao informado

## Regras de negocio do feed

- o feed inicial agrega apenas posts das parties do usuario
- ordenacao padrao por `created_at desc`
- os cards podem receber customizacao visual pela party de origem
- o card deve exibir autor, texto, imagem, likes, dislikes e comentarios
- o feed pode receber paginacao incremental

## Regras de negocio de party

- party tem membros, postagens e personalizacao propria
- party pode ser favoritada pelo usuario
- party pode alterar cor de fundo da pagina e cor dos cards
- party pode ter foto e banner
- party privada exige ingresso por convites ou aprovacao

## Regras de negocio do perfil

- foto de perfil e banner editaveis
- nome/apelido e email visiveis
- recado/bio editavel
- sexo e aniversario armazenados como dados do perfil
- metricas corporais devem ser editaveis e auditaveis no futuro
- status de treino deve suportar bulking, cutting e outros estados

## Regras de negocio do post

- post pode ter texto e uma imagem
- post pode receber like e dislike
- comentario pertence ao post e ao usuario que comentou
- a autoria do post sempre e preservada

## Regras de integridade

- usuario nao deve existir sem profile correspondente
- membro nao pode interagir com party da qual nao faz parte
- um usuario nao pode curtir e descurtir ao mesmo tempo o mesmo post
- cada conteudo deve ter relacao direta com um owner claro
- os contadores nao devem ser editados manualmente pela interface comum

## Fases de implementacao no Supabase

### Fase A - schema

- enums
- tabelas
- indices
- constraints

### Fase B - seguranca

- RLS
- policies
- permissoes de roles

### Fase C - automacao

- triggers
- funcoes RPC
- contadores
- streak

### Fase D - storage

- buckets
- politicas de upload e leitura

### Fase E - integracao com o app

- client Supabase
- auth Google
- queries
- mutations

## Resultado esperado desta etapa

Quando esta especificacao estiver implementada, o app deve conseguir:

- autenticar com Google
- criar perfil automaticamente
- criar party
- entrar em party
- favoritar party
- publicar post
- reagir a post
- comentar post
- manter streak de check-in
- ler feed apenas das parties corretas
