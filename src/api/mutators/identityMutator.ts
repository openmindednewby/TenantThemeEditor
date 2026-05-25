/**
 * Axios mutator for Identity Service API calls.
 * Used by Orval-generated hooks.
 */
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const IDENTITY_BASE_URL = '/api/identity';

export const identityInstance = axios.create({
  baseURL: IDENTITY_BASE_URL,
});

export default async function identityMutator<T>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return identityInstance(config);
}
