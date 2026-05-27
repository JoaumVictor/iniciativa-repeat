# Padrao de Projeto Mobile (Template Replicavel)

Este arquivo define um prompt mestre para iniciar um novo app mobile com a mesma arquitetura tecnica deste projeto, sem tema de negocio.

## Prompt Mestre (copiar e colar)

```text
Voce deve criar um app React Native com Expo, TypeScript, Expo Router e NativeWind, seguindo exatamente esta arquitetura.

OBJETIVO
- Criar um app base, sem tema de negocio, pronto para escalar por modulos.
- Seguir estrutura de pastas, convencoes e fluxo de dados definidos abaixo.
- Nao inventar estrutura alternativa.

VERSOES OBRIGATORIAS (fixar no package.json)
- expo: ~55.0.23
- react: 19.2.0
- react-native: 0.83.6
- typescript: ~5.9.2
- expo-router: ~55.0.14
- nativewind: ^4.0.1
- tailwindcss: ^3.4.14
- @tanstack/react-query: ^5.97.0
- axios: ^1.7.0
- zustand: ^5.0.0
- expo-secure-store: ~55.0.0
- expo-location: ~55.1.9
- expo-local-authentication: ~55.0.13
- react-native-reanimated: 4.2.1
- react-native-gesture-handler: ~2.30.0
- react-native-safe-area-context: 5.6.2
- react-native-screens: ~4.23.0
- react-native-svg: 15.15.3
- @expo/vector-icons: ^15.0.2
- @babel/core: ^7.25.0
- @types/react: ^19.1.1
- patch-package: ^8.0.1

Dependencias Expo adicionais importantes
- expo-camera: ~55.0.18
- expo-clipboard: ^55.0.13
- expo-document-picker: ~55.0.13
- expo-file-system: ~55.0.22
- expo-font: ^55.0.4
- expo-image-picker: ~55.0.20
- expo-linear-gradient: ~55.0.13
- expo-linking: ~55.0.15
- expo-media-library: ~55.0.17
- expo-sharing: ~55.0.20
- expo-status-bar: ~55.0.6

ESTRUTURA DE PASTAS (obrigatoria)
- app/
  - _layout.tsx                     -> root providers e bootstrap global
  - (auth)/                         -> fluxo de autenticacao
  - (app)/                          -> area logada
    - _layout.tsx                   -> tabs, navegacao principal e wrappers de UX da area logada
    - <modulo>/index.tsx            -> listagem/pagina principal do modulo
    - <modulo>/[id].tsx             -> detalhe de item
    - <modulo>/outras-rotas.tsx     -> fluxos complementares
- src/
  - api/                            -> client axios, query keys, chamadas HTTP por dominio
  - hooks/                          -> hooks de regra de negocio e react-query
  - store/                          -> estado global com zustand (auth, ui state, etc.)
  - services/                       -> integracoes nativas/externas (push, etc.)
  - components/
    - ui/                           -> componentes reutilizaveis base
    - <dominio>/                    -> componentes especificos por modulo
  - types/                          -> contratos de tipos
  - utils/                          -> funcoes utilitarias puras
  - config/                         -> constantes/configuracoes nao sensiveis
  - data/                           -> dados estaticos
  - mocks/                          -> mocks e fixtures para desenvolvimento
  - assets/                         -> assets internos de src
- assets/                           -> assets globais do app (icon, splash, etc.)
- scripts/                          -> scripts de ambiente/build

PADRAO DE ESTADO E CONTEXTO
- Nao usar Context API para estado de negocio.
- Usar Zustand em src/store para sessao, estado global e estado de UI.
- Providers globais ficam em app/_layout.tsx:
  - SafeAreaProvider
  - QueryClientProvider
  - bootstrap de autenticacao/hidratacao
- Wrappers especificos da area logada ficam em app/(app)/_layout.tsx (ex.: provider de tutorial).

PADRAO DE DADOS E API
- src/api/client.ts:
  - instancia axios unica
  - interceptor de request para token bearer
  - interceptor de response para refresh token em 401
- tokens em expo-secure-store.
- hooks em src/hooks encapsulam react-query e nao deixam tela chamar HTTP direto.
- query keys centralizadas em src/api/queryKeys.ts.

PADRAO DE TELAS
- Tela nao implementa regra de negocio complexa.
- Tela compoe componentes + hooks.
- Componentes de dominio em src/components/<dominio>.
- Componentes base em src/components/ui.

ALIAS E TYPESCRIPT
- Configurar alias @/* -> src/* em tsconfig.
- strict true obrigatorio.

NATIVEWIND E ESTILO
- NativeWind habilitado no Babel com:
  - preset babel-preset-expo com jsxImportSource nativewind
  - plugin nativewind/babel
  - plugin react-native-reanimated/plugin por ultimo
- tailwind.config.js com content em:
  - ./app/**/*.{js,jsx,ts,tsx}
  - ./src/**/*.{js,jsx,ts,tsx}

SCRIPTS MINIMOS
- start: expo start
- ios: expo run:ios
- android: expo run:android
- web: expo start --web
- clear-cache: expo start --clear
- postinstall: patch-package

SEGURANCA E CONFIG
- Nao hardcodar secrets.
- Variaveis sensiveis em .env.
- .env deve estar no .gitignore.
- Usar prefixo EXPO_PUBLIC_ somente para variaveis que podem ir para client.

CRITERIOS DE QUALIDADE
- Funcoes pequenas e nomes semanticos.
- Separacao clara: tela, componente, hook, store, api.
- Evitar duplicacao (DRY).
- Criar base pronta para testes e mocks.

ENTREGA ESPERADA
- Projeto inicial funcional com rotas (auth) e (app).
- Exemplo de 1 modulo completo com index + detalhe.
- Camada api, store e hooks conectadas no padrao acima.
- Sem tema visual de negocio (layout neutro).
```

## Observacao importante sobre compatibilidade

As versoes acima estao alinhadas entre si (Expo SDK 55 + React 19 + React Native 0.83). Se atualizar Expo, revise o conjunto inteiro de versoes antes de subir o projeto novo.
