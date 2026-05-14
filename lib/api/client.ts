import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { ZodSchema } from "zod";

export async function apiGet<T>(
  url: string,
  schema: ZodSchema<T>,
  config?: AxiosRequestConfig,
) {
  const response = await axios.get(url, config);
  return schema.parse(response.data);
}

export async function apiPost<TResponse, TRequest = unknown>(
  url: string,
  body: TRequest,
  schema: ZodSchema<TResponse>,
  config?: AxiosRequestConfig<TRequest>,
) {
  const response = await axios.post(url, body, config);
  return schema.parse(response.data);
}

export async function apiPatch<TResponse, TRequest = unknown>(
  url: string,
  body: TRequest,
  schema: ZodSchema<TResponse>,
  config?: AxiosRequestConfig<TRequest>,
) {
  const response = await axios.patch(url, body, config);
  return schema.parse(response.data);
}

export async function apiDelete<TResponse, TRequest = unknown>(
  url: string,
  schema: ZodSchema<TResponse>,
  config?: AxiosRequestConfig<TRequest>,
) {
  const response = await axios.delete(url, config);
  return schema.parse(response.data);
}

