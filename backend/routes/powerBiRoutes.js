const express = require("express");
const router = express.Router();
const axios = require("axios");

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const WORKSPACE_ID = process.env.WORKSPACE_ID;
const REPORT_ID = process.env.REPORT_ID;

async function getAccessToken() {
    try {
        const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", CLIENT_ID);
        params.append("client_secret", CLIENT_SECRET);
        params.append("scope", "https://analysis.windows.net/powerbi/api/.default");

        const resp = await axios.post(url, params.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        return resp.data.access_token;
    } catch (error) {
        console.error("Token acquisition error:", error.response?.data || error.message);
        throw error;
    }
}

router.post("/getEmbedToken", async (req, res) => {
    try {
        const accessToken = await getAccessToken();

        console.log(accessToken,"accessToken");
        console.log("Access Token acquired successfully");

        // Test basic API access first
        const testResponse = await axios.get(
            `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("Workspace access test passed");

        const reportResp = await axios.get(
            `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log("Report access successful");

        const embedResp = await axios.post(
            `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}/GenerateToken`,
            { 
                accessLevel: "View",
                lifetimeInMinutes: 60
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data = {
            embedToken: embedResp.data.token,
            embedUrl: reportResp.data.embedUrl,
            reportId: REPORT_ID,
        };

        return res.json({ message: "Data Fetched successfully.", data : data, success: true });

    } catch (error) {
        console.error("Error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 403) {
            return res.status(500).json({ message: "Permission denied. Please check API permissions and workspace access.", error: error.response?.data || error.message, success: false });
        } else {
            return res.status(500).json({ message: "Failed to get Embed Token", error: error.response?.data || error.message, success: false });
        }

    }
});

module.exports = router;