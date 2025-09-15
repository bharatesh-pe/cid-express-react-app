const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async directLogin(mobile_number) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile_number }),
    });
  }

  async sendOTP(mobile_number) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile_number }),
    });
  }

  async verifyOTP(mobile_number, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile_number, otp }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Application methods
  async getApplications() {
    return this.request('/applications');
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(data) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(id, data) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // SSO methods
  async generateSSOToken(applicationCode) {
    return this.request(`/sso/generate/${applicationCode}`, {
      method: 'POST',
    });
  }

  async validateSSOToken(token) {
    return this.request('/sso/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Encrypted token methods
  async generateEncryptedToken(applicationCode) {
    return this.request('/sso/generate-encrypted-token', {
      method: 'POST',
      body: JSON.stringify({ applicationCode }),
    });
  }

  async validateEncryptedToken(token) {
    return this.request('/sso/validate-encrypted-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('police_application_token');
    const user = localStorage.getItem('police_application_user');
    return !!(token && user);
  }

  getStoredUser() {
    const user = localStorage.getItem('police_application_user');
    return user ? JSON.parse(user) : null;
  }

  setAuthData(token, user) {
    localStorage.setItem('police_application_token', token);
    localStorage.setItem('police_application_user', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('police_application_token');
    localStorage.removeItem('police_application_user');
  }
}

export default new ApiService();
