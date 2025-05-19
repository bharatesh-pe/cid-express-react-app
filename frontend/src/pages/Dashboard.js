import React, { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Card,
    CardContent,
    Stack,
    Avatar,
    Paper,
    Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import LogoText from "../Images/cid_logo.png";

    const tabLabels = [
        "UI Case",
        "PT Case",
        "Enquiries",
        "Goverment Order",
        "Judgements",
        "Circular",
    ];

    const jobData = [
        {
            title: "Progress Report",
            totalcase:100,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Action Plan",
            totalcase:67,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "FSL",
            totalcase:22,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Case",
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
    ];

    const getAvatarColor = (days) => {
        switch (days) {
            case "30":
                return "linear-gradient(135deg, #4caf50, #81c784)";
            case "15":
                return "linear-gradient(135deg, #ff9800, #fb8c00)";
            case "5":
                return "linear-gradient(135deg, #f44336, #e53935)";
            default:
                return "linear-gradient(135deg, #9e9e9e, #bdbdbd)";
        }
    };

    const GradientBadge = styled(Box)(({ gradient }) => ({
        background: gradient,
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        padding: '4px 8px',
        borderRadius: '999px',
        display: 'inline-block',
        minWidth: 32,
        textAlign: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    }));

    const cardBackgrounds = [
        "linear-gradient(135deg, #f6d365, #fda085)", // soft orange to coral
        "linear-gradient(135deg, #a1c4fd, #c2e9fb)", // sky blue gradient
        "linear-gradient(135deg, #fccb90, #d57eeb)", // peach to lavender
        "linear-gradient(135deg, #84fab0, #8fd3f4)", // mint green to sky blue
        "linear-gradient(135deg, #e0c3fc, #8ec5fc)", // soft purple to light blue
        "linear-gradient(135deg, #ffecd2, #fcb69f)", // warm sand to rose
    ];



const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                }}
                p={2}
                px={10}
            >
                <Box sx={{ display: "flex", alignItems: "center", height: 56 }}>
                    <img
                        srcSet={`${LogoText}?w=150&fit=crop&auto=format&dpr=2 4x`}
                        src={`${LogoText}?w=150&fit=crop&auto=format`}
                        alt="CID Logo"
                        loading="lazy"
                    />
                    <Typography
                        variant="subtitle1"
                        sx={{ ml: 1, fontWeight: "bold", color: "#333", lineHeight: 1.2 }}
                    >
                        Case Management
                        <br />
                        System
                    </Typography>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        ".MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            color: "#1d2939",
                        },
                        ".Mui-selected": {
                            color: "#1976d2",
                        },
                    }}
                >
                    {tabLabels.map((label, idx) => (
                        <Tab key={idx} label={label} />
                    ))}
                </Tabs>

                <Box sx={{width: '100px'}}></Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    pb: 1,
                }}
            >
                {jobData.map((job, idx) => (
                    <Card
                    key={idx}
                    elevation={6}
                    sx={{
                        width: 280,
                        borderRadius: 3,
                        p: 2,
                        background: cardBackgrounds[idx] || "#fff",
                        flexShrink: 0,
                        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.12), 0 6px 6px rgba(0, 0, 0, 0.08)",
                        transition: "transform 0.3s ease",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                    >
                    {/* Header */}
                    <Box sx={{ textAlign: "center", mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333" }}>
                        {job.title}
                        </Typography>
                    </Box>

                    {/* Total Count */}
                    <Box sx={{ textAlign: "center", my: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#000" }}>
                        {job.totalcase}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                        Total Cases
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.1)" }} />

                    {/* Bottom Sections */}
                    <Box
                        sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        }}
                    >
                        {["30", "15", "5"].map((daysKey) => {
                        const match = job.stages.find((s) => s.days === daysKey);
                        return (
                            <Box
                            key={daysKey}
                            sx={{ textAlign: "center", flex: 1 }}
                            >
                            <Typography variant="caption" sx={{ color: "#444", fontWeight: 500 }}>
                                {daysKey}+ Days
                            </Typography>
                            <GradientBadge gradient={getAvatarColor(daysKey)}>
                                {match ? match.count : 0}
                            </GradientBadge>
                            </Box>
                        );
                        })}
                    </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default Dashboard;
