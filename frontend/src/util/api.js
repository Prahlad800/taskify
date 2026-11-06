export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3030' : 'https://backend-taskify.notesnaxa.workers.dev')).replace(/\/+$/, '');
