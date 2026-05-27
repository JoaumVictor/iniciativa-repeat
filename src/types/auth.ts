export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type HydratedAuthState = AuthTokens & {
  isAuthenticated: boolean;
};
