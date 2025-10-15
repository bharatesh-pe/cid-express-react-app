import { API_BASE_URL } from './api.js';

// Power BI Service for handling authentication and embed URLs via backend API
class PowerBIService {
    constructor() {
        this.config = {
            workspaceId: 'bcb18a0f-e701-4e30-88a6-ddea7062043c',
            reportId: '95ee3cd6-a079-412c-b345-193d0b836be3',
            tenantId: '94dbcc7c-6e32-4329-a59a-3fb79b6fb70e'
        };
        
        this.baseUrl = API_BASE_URL;
        this.embedToken = null;
        this.tokenExpiry = null;
        this.cachedReportId = null;
    }

    getAuthToken() {
        return localStorage.getItem('police_application_token') || sessionStorage.getItem('police_application_token');
    }

    /**
     * Get embed token - Returns just the token string, not the response object
     */
    async getEmbedToken(reportId = null) {
        try {
            // Check if we have a valid token already
            const currentReportId = reportId || this.config.reportId;
            console.log('Current report ID:', currentReportId);
            if (this.embedToken && this.cachedReportId === currentReportId && !this.isTokenExpired()) {
                console.log('Using existing valid embed token for report:', currentReportId);
                return this.embedToken;
            }
            
            const authToken = this.getAuthToken();
            if (!authToken) {
                throw new Error('User is not authenticated. Please log in.');
            }

            console.log('Requesting new embed token from backend for report:', finalReportId);
            
            const response = await fetch(`${this.baseUrl}/powerbi/embed-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    reportId: finalReportId,
                    workspaceId: this.config.workspaceId
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.embedToken = null;
                    this.tokenExpiry = null;
                    throw new Error('Authentication expired. Please log in again.');
                }
                
                const errorText = await response.text();
                throw new Error(`Embed token request failed: ${response.status} - ${errorText}`);
            }

            const embedData = await response.json();
            
            if (!embedData.success) {
                throw new Error(embedData.error || 'Failed to get embed token');
            }

            if (!embedData.embed_token) {
                throw new Error('No embed token received from server');
            }

            // Store the token string directly
            this.embedToken = embedData.embed_token;
            this.tokenExpiry = Date.now() + (embedData.expires_in || 3600) * 1000;
            this.cachedReportId = currentReportId;
            
            console.log('Embed token obtained successfully for report:', finalReportId);
            console.log('Token length:', this.embedToken.length);
            
            // Return just the token string
            return this.embedToken;
        } catch (error) {
            console.error('Error getting embed token:', error);
            throw error;
        }
    }

    /**
     * Get report configuration
     */
    async getReportConfig() {
        try {
            const authToken = this.getAuthToken();
            if (!authToken) {
                throw new Error('User is not authenticated. Please log in.');
            }

            const response = await fetch(`${this.baseUrl}/powerbi/config`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Config request failed: ${response.status}`);
            }

            const configData = await response.json();
            
            if (!configData.success) {
                throw new Error(configData.error || 'Failed to get report configuration');
            }

            return configData.config;
        } catch (error) {
            console.error('Error getting report config:', error);
            throw error;
        }
    }

    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        // Add 5 minute buffer before actual expiry
        return Date.now() >= (this.tokenExpiry - 300000);
    }

    async refreshReport() {
        try {
            console.log('Refreshing Power BI report...');
            this.embedToken = null;
            this.tokenExpiry = null;
            this.lastReportId = null;
            return await this.getEmbedToken();
        } catch (error) {
            console.error('Error refreshing report:', error);
            throw error;
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.embedToken = null;
        this.tokenExpiry = null;
        this.lastReportId = null;
    }
}

// Create and export singleton instance
const powerBIService = new PowerBIService();
export default powerBIService;
