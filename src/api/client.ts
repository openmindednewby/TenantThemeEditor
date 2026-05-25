/**
 * Axios instance for Identity Service API calls.
 */
import axios from 'axios';

export const identityClient = axios.create({
  baseURL: '/api/identity',
  headers: { 'Content-Type': 'application/json' },
});

export const contentClient = axios.create({
  baseURL: '/api/content',
  headers: { 'Content-Type': 'application/json' },
});
