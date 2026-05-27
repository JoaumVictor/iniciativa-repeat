import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_URL } from "@/config/env";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/services/tokenStorage";

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

export const client = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
});

client.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await clearTokens();
      return Promise.reject(error);
    }

    try {
      const { data } = await refreshClient.post<{
        accessToken: string;
        refreshToken?: string;
      }>("/auth/refresh", {
        refreshToken,
      });

      const nextTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? refreshToken,
      };

      await saveTokens(nextTokens);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextTokens.accessToken}`;
      }

      return client(originalRequest);
    } catch (refreshError) {
      await clearTokens();
      return Promise.reject(refreshError);
    }
  },
);
