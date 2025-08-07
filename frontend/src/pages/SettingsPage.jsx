import { Box, Button, Tab, Tabs, TextField } from "@mui/material";
import { useState } from "react";


const SettingsPage = ()=> {

    const [settingTabs, setSettingTabs] = useState(0);

    const handleSettingTabsChange = (event, newValue) => {
        setSettingTabs(newValue);
    };

    return (
        <Box px={5} py={2}>
            <Box display="grid" gridTemplateColumns="1fr 2fr 1fr" alignItems="center" mb={2}>
                <h2 style={{ margin: 0 }}>Settings</h2>
                <Tabs
                    value={settingTabs}
                    onChange={handleSettingTabsChange}
                    textColor="primary"
                    indicatorColor="primary"
                    centered
                >
                    <Tab label="SMS" />
                    <Tab label="Email" />
                </Tabs>
            </Box>

            {settingTabs === 0 && (
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    mx="auto"
                    bgcolor="background.paper"
                    borderRadius={3}
                >
                    <Box>
                        <label htmlFor="sms-message" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                            SMS Message
                        </label>
                        <TextField
                            id="sms-message"
                            multiline
                            minRows={5}
                            maxRows={10}
                            variant="outlined"
                            fullWidth
                            placeholder="Enter your SMS message here..."
                            sx={{
                                background: "#fafbfc",
                                borderRadius: 2,
                                '& .MuiInputBase-root': {
                                    overflow: 'auto'
                                }
                            }}
                        />
                    </Box>
                    <Box>
                        <label htmlFor="sms-footer" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                            SMS Message 2
                        </label>
                        <TextField
                            id="sms-footer"
                            multiline
                            minRows={5}
                            maxRows={10}
                            variant="outlined"
                            fullWidth
                            placeholder="Enter your SMS message here..."
                            sx={{
                                background: "#fafbfc",
                                borderRadius: 2,
                                '& .MuiInputBase-root': {
                                    overflow: 'auto'
                                }
                            }}
                        />
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="medium"
                            sx={{
                                background: "linear-gradient(90deg, #1976d2 0%, #1976d2 100%)",
                                color: "#fff",
                                fontWeight: 500,
                                px: 4,
                                borderRadius: 2,
                                fontSize: "16px",
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                                textTransform: "none",
                                '&:hover': {
                                    background: "linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)",
                                }
                            }}
                        >
                            Send SMS
                        </Button>
                    </Box>
                </Box>
            )}

            {settingTabs === 1 && (
                <Box
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    mx="auto"
                    bgcolor="background.paper"
                    borderRadius={3}
                >
                    <Box>
                        <label htmlFor="email-message" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                            Email Message
                        </label>
                        <TextField
                            id="email-message"
                            multiline
                            minRows={8}
                            maxRows={16}
                            variant="outlined"
                            fullWidth
                            placeholder="Enter your email message here..."
                            sx={{
                                background: "#fafbfc",
                                borderRadius: 2,
                                '& .MuiInputBase-root': {
                                    overflow: 'auto'
                                }
                            }}
                        />
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="medium"
                            sx={{
                                background: "linear-gradient(90deg, #1976d2 0%, #1976d2 100%)",
                                color: "#fff",
                                fontWeight: 500,
                                px: 4,
                                borderRadius: 2,
                                fontSize: "16px",
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
                                textTransform: "none",
                                '&:hover': {
                                    background: "linear-gradient(90deg, #1565c0 0%, #1e88e5 100%)",
                                }
                            }}
                        >
                            Send Email
                        </Button>
                    </Box>
                </Box>
            )}

        </Box>
    );
}

export default SettingsPage;