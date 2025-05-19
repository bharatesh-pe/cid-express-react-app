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
    Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import LogoText from "../Images/cid_logo.png";
import { useNavigate } from 'react-router-dom';

    const tabLabels = [
        { label: "UI Case", route: "/case/ui_case" },
        { label: "PT Case", route: "/case/pt_case" },
        { label: "Enquiries", route: "/case/enquiry" },
        { label: "Government Order", route: "/repository/gn_order" },
        { label: "Judgements", route: "/repository/judgements" },
        { label: "Circular", route: "/repository/circular" },
    ];


    const jobData = [
        {
            title: "Case IO Allocation Pending",
            totalcase:100,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Action Plans Approval Pending",
            totalcase:67,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Progress Reports Pending",
            totalcase:22,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Investigation Extension Approvals", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Cases for Trial Today", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "FSL Overdue Today", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "41A Notice Approvals Pending", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Charge Sheet (CC) Pendency", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Custodial Cases for Chargesheet", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "Overdue Actions", 
            totalcase:70,
            stages: [
                { days: "30", count: 87 },
                { days: "15", count: 52 },
                { days: "10", count: 7 },
                { days: "5", count: 1 },
            ],
        },
        {
            title: "PF Pendency to FSL", 
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
        const dayValue = Number(days);

        if (dayValue === 0) {
            return "linear-gradient(135deg, #4caf50, #81c784)";
        } else if (dayValue === 1) {
            return "linear-gradient(135deg, #ff9800, #fb8c00)";
        } else if (dayValue === 2) {
            return "linear-gradient(135deg, #f44336, #e53935)";
        } else {
            return "linear-gradient(135deg, #4caf50, #81c784)";
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
    "linear-gradient(135deg, #569bd0, #5c5ee0)",  // 1 - darker blue
    "linear-gradient(135deg, #a5a6d9, #8a4fd1)",  // 2 - darker lavender
    "linear-gradient(135deg, #8c8dc7, #2c38c4)",  // 3 - deeper indigo
    "linear-gradient(135deg, #a5a6d9, #3d3fd0)",  // 4 - deeper violet
    "linear-gradient(135deg, #65bda3, #4a8c73)",  // 5 - teal green
    "linear-gradient(135deg, #e2a37e, #cf5d3f)",  // 6 - burnt orange
    "linear-gradient(135deg, #dc87b1, #b24f91)",  // 7 - rose pink
    "linear-gradient(135deg, #f0c95e, #e09826)",  // 8 - amber gold
    "linear-gradient(135deg, #9fa3b0, #727681)",  // 9 - slate grey
    "linear-gradient(135deg, #97a7f7, #5c6be5)",  // 10 - soft periwinkle
    "linear-gradient(135deg, #7cc6fe, #3b95e4)"   // 11 - sky blue
    ];

    const cardHoverBackgrounds = [
    "linear-gradient(135deg, #467fb0, #484ad0)",  // 1
    "linear-gradient(135deg, #8e8fc2, #743ebf)",  // 2
    "linear-gradient(135deg, #6f70a9, #1f2cae)",  // 3
    "linear-gradient(135deg, #8e8fc2, #2d2fbf)",  // 4
    "linear-gradient(135deg, #519c8c, #35775f)",  // 5
    "linear-gradient(135deg, #cb8d6c, #b04c30)",  // 6
    "linear-gradient(135deg, #c27399, #94396e)",  // 7
    "linear-gradient(135deg, #deb648, #c37d15)",  // 8
    "linear-gradient(135deg, #868b9b, #5a5f6a)",  // 9
    "linear-gradient(135deg, #7b8cdd, #4553d1)",  // 10
    "linear-gradient(135deg, #66b1f0, #2a7fd1)"   // 11
    ];

    const cardTitleBackgrounds = [
    "#6b9ddf",  // 1 - bright blue
    "#b5aaf0",  // 2 - soft lavender
    "#9295dc",  // 3 - light indigo
    "#a2a5f2",  // 4 - light violet
    "#7ecdb7",  // 5 - mint green
    "#ee9f76",  // 6 - orange coral
    "#e58fb4",  // 7 - rose pink
    "#f5d97b",  // 8 - warm yellow
    "#adb2c0",  // 9 - slate grey
    "#a2b4fc",  // 10 - pastel periwinkle
    "#8dcfff"   // 11 - light sky blue
    ];


    const bottomActions = {
        "Overdue Actions" : {
            "colorCode" : true,
            "actions" : [
                "AP Pending",
                "PR Pending",
                "Due Date Missed"
            ]
        },
        "PF Pendency to FSL" : {
            "colorCode" : true,
            "actions" : [
                "Beyond Day 30",
                "Day 20–30",
                "Day 10–20"
            ]
        },
        "Custodial Cases for Chargesheet": {
            "actions" : [
                "30th Day from Arrest",
                "45th Day"
            ]
        }
    }

    
    
    
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const userId = localStorage.getItem("user_id");

    if (userId === "1") return null;

    return (
        <Box sx={{ bgcolor: "#e5e7eb", minHeight: "100vh" }}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 5,
                    bgcolor: '#FFFFFF'
                }}
                p={1}
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
                    {tabLabels.map((element, idx) => (
                        <Tab key={idx} label={element?.label} />
                    ))}
                </Tabs>

                <Box sx={{width: '100px'}}></Box>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    pb: 1,
                }}
            >
                {jobData.map((job, idx) => (
                    <Card
                    key={idx}
                    elevation={6}
                    onClick={() => navigate(tabLabels?.[activeTab]?.route)}
                    sx={{
                        width: bottomActions && bottomActions?.[job.title]?.actions ? 405 : 300,
                        maxHeight: 130,
                        minHeight: 130,
                        borderRadius: 3,
                        background: cardBackgrounds[idx] || "#fff",
                        flexShrink: 0,
                        boxShadow: "0 2px 2px rgba(0, 0, 0, 0.12), 0 6px 6px rgba(0, 0, 0, 0.08)",
                        transition: "transform 0.3s ease",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        '&:hover': {
                            background: cardHoverBackgrounds[idx] || cardBackgrounds[idx],
                            transform: 'translateY(-4px)'
                        }
                    }}
                    >
                    {/* Header */}
                    <Box sx={{ textAlign: "center", p: 1, borderRadius: 3 , background: cardTitleBackgrounds[idx] || "#fff", }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                        {job.title}
                        </Typography>
                    </Box>

                    {/* Total Count */}
                    {/* <Box sx={{ textAlign: "center", p: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "#FFFFFF" }}>
                        {job.totalcase}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#FFFFFF" }}>
                        Total Cases
                        </Typography>
                    </Box> */}

                    {/* Bottom Sections */}
                    <Box
                        sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flex: 1,
                        }}
                    >
                        {
                        bottomActions && bottomActions?.[job.title]?.actions ?
                            bottomActions?.[job.title]?.actions.map((daysKey, i) => {
                            const match = job.stages.find((s) => s.days === daysKey);
                            return (
                                <Tooltip title={daysKey}>
                                    <Box
                                        key={daysKey}
                                        sx={{ 
                                            minWidth: 0,
                                            flex: "1 1 0",
                                            p: 1,
                                            textAlign: "center", 
                                            borderLeft: i !== 0 ? "1px solid rgba(255, 255, 255, 0.3)" : "none", 
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#FFFFFF",
                                                fontWeight: 500,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                maxHeight: "2.8em", // optional: ensures the box doesn't grow more than 2 lines
                                                lineHeight: "1.4em", // adjust line height as needed
                                            }}
                                        >
                                            {daysKey}
                                        </Typography>
                                        <GradientBadge gradient={getAvatarColor(i)}>
                                            {match ? match.count : 0}
                                        </GradientBadge>
                                    </Box>
                                </Tooltip>
                            );
                            })
                        :
                            <Box sx={{ textAlign: "center", p: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 500, color: "#FFFFFF", textAlign: 'center' }}>
                                    10
                                </Typography>
                            </Box>
                        }
                    </Box>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default Dashboard;
