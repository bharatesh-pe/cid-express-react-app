export const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'http://139.59.35.227:5000/api';
// export const API_BASE_URL = 'https://cop-main.patterneffects.in/api';

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
    const token = localStorage.getItem('police_application_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Auth token found and added to request');
    } else {
      console.warn('⚠️ No auth token found in localStorage');
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
    const res = await fetch(`${API_BASE_URL}/applications`);
    return await res.json();
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

  async validateSSOToken(tokenId) {
    return this.request('/sso/validate', {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  }

  // Encrypted token methods
  async generateEncryptedToken(applicationCode) {
    return this.request('/sso/generate-encrypted-token', {
      method: 'POST',
      body: JSON.stringify({ applicationCode }),
    });
  }

  async validateEncryptedToken(tokenId) {
    return this.request('/sso/validate-encrypted-token', {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  }

  // Get token metadata
  async getTokenMetadata(tokenId) {
    return this.request('/sso/get-token', {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
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

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get all users
  async getUsers(offset = 0, limit = 10, search = '') {
    const params = new URLSearchParams({ offset, limit });
    if (search) params.append('search', search);
    const res = await this.request(`/users?${params.toString()}`, { method: 'GET' });
    return res;
  }

  // Update user
  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete user
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Set user as inactive
  async setUserInactive(id) {
    return this.updateUser(id, { isActive: false });
  }

  async editUser(id, data) {
    return this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    });
}
}

export default new ApiService();
