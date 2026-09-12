import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAccessToken = (
  token: string | null
) => {
  if (token) {
    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};