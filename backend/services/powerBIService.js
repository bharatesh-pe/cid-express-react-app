const axios = require('axios');

class PowerBIService {
    constructor() {
        this.config = {
            client_id: process.env.POWERBI_CLIENT_ID,
            client_secret: process.env.POWERBI_CLIENT_SECRET,
            tenant_id: process.env.POWERBI_TENANT_ID,
            workspace_id: process.env.POWERBI_WORKSPACE_ID,
            report_id: process.env.POWERBI_REPORT_ID,
            scope: 'https://analysis.windows.net/powerbi/api/.default',
            verify_ssl: process.env.NODE_ENV === 'production'
        };
        
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get access token for Power BI API
     */
    async getAccessToken() {
        try {
            // Check if we have a valid token already
            if (this.accessToken && !this.isTokenExpired()) {
                console.log('Using existing valid access token');
                return this.accessToken;
            }

            console.log('Requesting new Power BI access token...');
            
            const tokenUrl = `https://login.microsoftonline.com/${this.config.tenant_id}/oauth2/v2.0/token`;
            
            const response = await axios.post(tokenUrl, {
                client_id: this.config.client_id,
                client_secret: this.config.client_secret,
                scope: this.config.scope,
                grant_type: 'client_credentials'
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 30000,
                httpsAgent: this.config.verify_ssl ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            console.log('Power BI access token obtained successfully');
            return this.accessToken;

        } catch (error) {
            console.error('Error getting Power BI access token:', error.response?.data || error.message);
            throw new Error(`Failed to get Power BI access token: ${error.response?.data?.error_description || error.message}`);
        }
    }

    /**
     * Generate embed token for Power BI report
     */
    async generateEmbedToken() {
        try {
            const accessToken = await this.getAccessToken();
            
            const embedUrl = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspace_id}/reports/${this.config.report_id}/GenerateToken`;
            
            const requestBody = {
                accessLevel: 'View',
                allowSaveAs: false,
                datasetId: this.config.report_id,
                identities: [],
                lifetimeInMinutes: 60
            };
            
            const response = await axios.post(embedUrl, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000,
                httpsAgent: this.config.verify_ssl ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            console.log('Power BI embed token generated successfully');
            
            return {
                token: response.data.token,
                tokenId: response.data.tokenId,
                expiration: response.data.expiration,
                expiresIn: 3600
            };

        } catch (error) {
            console.error('Error generating Power BI embed token:', error.response?.data || error.message);
            throw new Error(`Failed to generate embed token: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Get report configuration
     */
    getReportConfig() {
        return {
            workspaceId: this.config.workspace_id,
            reportId: this.config.report_id,
            tenantId: this.config.tenant_id,
            embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${this.config.report_id}&groupId=${this.config.workspace_id}`
        };
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        // Add 5 minute buffer before actual expiry
        return Date.now() >= (this.tokenExpiry - 300000);
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        this.accessToken = null;
        this.tokenExpiry = null;
        return await this.getAccessToken();
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.accessToken = null;
        this.tokenExpiry = null;
    }
}

module.exports = new PowerBIService();
