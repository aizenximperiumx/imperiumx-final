const inferApiBase = () => {
  // Prefer Vite env if provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv: any = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) || {};
  const viteBase = viteEnv?.VITE_API_URL || '';
  if (viteBase) return String(viteBase).replace(/\/$/, '');
  // In Vite dev, default to backend on port 5000
  if (viteEnv?.DEV) {
    return 'http://localhost:5000/api';
  }
  // Fallback to same-origin /api in production
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/api`;
  }
  // Last resort
  return 'http://localhost:5000/api';
};

const API_URL = inferApiBase();

const api = {
  async get(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = (errData && (errData.message || errData.error)) || `Request failed (${response.status})`;
        if (response.status === 403 && (msg.includes('Account disabled'))) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(msg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        throw new Error(isLocal ? 'Cannot connect to backend server. Is it running locally on port 5000?' : 'Service temporarily unavailable. Please try again shortly.');
      }
      throw error;
    }
  },

  async post(endpoint: string, data?: any, options?: RequestInit) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = (errData && (errData.message || errData.error)) || `Request failed (${response.status})`;
        if (response.status === 403 && (msg.includes('Account disabled'))) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(msg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        throw new Error(isLocal ? 'Cannot connect to backend server. Is it running locally on port 5000?' : 'Service temporarily unavailable. Please try again shortly.');
      }
      throw error;
    }
  },

  async patch(endpoint: string, data?: any, options?: RequestInit) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = (errData && (errData.message || errData.error)) || `Request failed (${response.status})`;
        if (response.status === 403 && (msg.includes('Account disabled'))) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(msg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        throw new Error(isLocal ? 'Cannot connect to backend server. Is it running locally on port 5000?' : 'Service temporarily unavailable. Please try again shortly.');
      }
      throw error;
    }
  },

  async delete(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const msg = (errData && (errData.message || errData.error)) || `Request failed (${response.status})`;
        if (response.status === 403 && (msg.includes('Account disabled'))) {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(msg);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        throw new Error(isLocal ? 'Cannot connect to backend server. Is it running locally on port 5000?' : 'Service temporarily unavailable. Please try again shortly.');
      }
      throw error;
    }
  },
};

export default api;
