const axios = require('axios');

class PowerBIController {
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
    }

    /**
     * Get Power BI access token
     */
    getAccessToken = async (req, res) => {
        try {
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

            return res.json({
                success: true,
                access_token: response.data.access_token,
                expires_in: response.data.expires_in,
                token_type: response.data.token_type
            });

        } catch (error) {
            console.error('Power BI token request failed:', error.response?.data || error.message);
            
            return res.status(error.response?.status || 500).json({
                success: false,
                error: 'Failed to get access token',
                details: error.response?.data || error.message
            });
        }
    }

    /**
     * Get Power BI embed token
     */
    getEmbedToken = async (req, res) => {
        try {
            // Get report ID from request body or use default
            const reportId = req.body.reportId || this.config.report_id;
            
            // Get access token first
            const tokenUrl = `https://login.microsoftonline.com/${this.config.tenant_id}/oauth2/v2.0/token`;
            
            const tokenResponse = await axios.post(tokenUrl, {
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

            const accessToken = tokenResponse.data.access_token;
            
            // // Get dataset ID from report details
            // const reportDetailsUrl = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspace_id}/reports/${reportId}`;
            // const reportDetails = await axios.get(reportDetailsUrl, {
            //     headers: { Authorization: `Bearer ${accessToken}` }
            // });
            // const datasetId = reportDetails.data.datasetId;

            // Generate embed token with proper configuration
            const embedUrl = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspace_id}/reports/${reportId}/GenerateToken`;
            
            const requestBody = {
                accessLevel: 'View',
                allowSaveAs: false,
                identities: [], // Empty for service principal auth
                datasetId: reportId,
                lifetimeInMinutes: 60 // Token valid for 60 minutes
            };
            
            const embedResponse = await axios.post(embedUrl, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000,
                httpsAgent: this.config.verify_ssl ? undefined : new (require('https').Agent)({ rejectUnauthorized: false })
            });

            console.log('Power BI embed token generated successfully', {
                token_id: embedResponse.data.tokenId || 'N/A',
                expiration: embedResponse.data.expiration || 'N/A'
            });

            // Return just the token string
            return res.json({
                success: true,
                embed_token: embedResponse.data.token,
                token_id: embedResponse.data.tokenId || null,
                expiration: embedResponse.data.expiration || null,
                expires_in: 3600 // 1 hour
            });

        } catch (error) {
            console.error('Power BI embed token error:', error.response?.data || error.message);
            
            return res.status(error.response?.status || 500).json({
                success: false,
                error: 'Failed to generate embed token',
                details: error.response?.data || error.message
            });
        }
    }

    /**
     * Get Power BI report configuration
     */
    getReportConfig = async (req, res) => {
        try {
            return res.json({
                success: true,
                config: {
                    workspaceId: this.config.workspace_id,
                    reportId: this.config.report_id,
                    tenantId: this.config.tenant_id,
                    embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${this.config.report_id}&groupId=${this.config.workspace_id}`
                }
            });
        } catch (error) {
            console.error('Power BI config error:', error.message);
            
            return res.status(500).json({
                success: false,
                error: 'Failed to get report configuration',
                details: error.message
            });
        }
    }
}

module.exports = new PowerBIController();
