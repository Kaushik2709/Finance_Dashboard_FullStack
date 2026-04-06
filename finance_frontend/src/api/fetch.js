const API_URL = import.meta.env.VITE_API_URL || '/api';

class FetchClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Bearer token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const body = isJson ? await response.json().catch(() => null) : null;

      if (!response.ok) {
        const errorMessage =
          body?.error?.message ||
          body?.message ||
          'API Error';

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = body || {};

        // If we had a session token and it's no longer valid, clear it and
        // force a login redirect. For invalid login attempts (no token yet),
        // we simply throw so the UI can show the error.
        if (response.status === 401) {
          const hadToken = Boolean(token);
          localStorage.removeItem('token');
          if (hadToken) {
            window.location.href = '/#/login';
          }
        }

        throw error;
      }

      // Handle empty or non-JSON responses
      if (!isJson) return null;
      return body;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new FetchClient(API_URL);
