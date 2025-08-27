import type { AxiosResponse } from "axios";
import httpClient from "./httpClient";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  consent: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}

type GameStartGameInterfaceash = {
  hash: string;
  expires_at: string;
};

export const UserService = {
  async getCsrf() {
    return httpClient.get("/sanctum/csrf-cookie");
  },

  async register(formInput: RegisterFormData) {
    const response = await httpClient.post<FormData, AxiosResponse>(
      "/api/register",
      formInput
    );
    return response.data;
  },

  async login(formInput: LoginFormData) {
    const response = await httpClient.post<FormData, AxiosResponse>(
      "/api/login",
      formInput
    );
    return response.data;
  },

  async user() {
    const response = await httpClient.get("/api/user");
    return response.data;
  },

  async start() {
    const response = await httpClient.post<GameStartGameInterfaceash>(
      "/api/game"
    );
    return response.data;
  },

  async logout() {
    const response = await httpClient.post("/api/logout");
    return response.data;
  },

  async sendScore(id: any, payload: any) {
    return await httpClient.post(`/api/game/score/${id}`, payload);
  },

  async getScore(id: any) {
    const response = await httpClient.get(`/api/game/get/${id}`);
    return response.data;
  },
};

