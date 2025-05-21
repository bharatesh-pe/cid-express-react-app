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
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import LogoText from "../Images/cid_logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    
    const location = useLocation();
    const [userOverallDesignation, setUserOverallDesignation] = useState(localStorage.getItem("userOverallDesignation") ? JSON.parse(localStorage.getItem("userOverallDesignation")) : []);
    const [openUserDesignationDropdown, setOpenUserDesignationDropdown] = useState(false);
    const userName = localStorage.getItem("username");
    const designationName = localStorage.getItem("designation_name");
    
    const [loading, setLoading] = useState(false);
    
    if (userId === "1") return null;

        const handleLogout = async () => {
            const token = localStorage.getItem("auth_token");
            setLoading(true);
            try {
                const serverURL = process.env.REACT_APP_SERVER_URL;
                const response = await fetch(`${serverURL}/auth/logout`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    token: token,
                    },
                });
            
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }
                setLoading(false);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("username");
                localStorage.removeItem("authAdmin");
                localStorage.removeItem("kgid");
                localStorage.removeItem("user_permissions");
                localStorage.removeItem("designation_id");
                localStorage.removeItem("designation_name");
                localStorage.removeItem("user_id");
                localStorage.removeItem("division_id");
                localStorage.removeItem("division_name");
                localStorage.removeItem("allowedUserIds");
                localStorage.removeItem("getDataBasesOnUsers");
                localStorage.removeItem("allowedDepartmentIds");
                localStorage.removeItem("allowedDivisionIds");
                localStorage.removeItem("role_id");
                localStorage.removeItem("role_title");
                navigate("/");
            } catch (err) {
            var errMessage = "Something went wrong. Please try again.";
            if (err && err.message) {
                errMessage = err.message;
            }
        
            if (errMessage) {
                // errMessage = await errMessage.json();
                if (errMessage && errMessage.includes("Authorization_error")) {
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("authAdmin");
                    localStorage.removeItem("kgid");
                    localStorage.removeItem("user_permissions");
                    localStorage.removeItem("designation_id");
                    localStorage.removeItem("designation_name");
                    localStorage.removeItem("allowedUserIds");
                    localStorage.removeItem("getDataBasesOnUsers");
                    localStorage.removeItem("allowedDepartmentIds");
                    localStorage.removeItem("allowedDivisionIds");
                    localStorage.removeItem("role_id");
                    localStorage.removeItem("role_title");
                navigate("/");
                }
            }
        
            toast.error(errMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-warning",
            });
            return;
            }
            finally {
                setLoading(false);
            }
        };

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
                px={3}
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

                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Box onClick={() => setOpenUserDesignationDropdown(true)} sx={{ cursor: "pointer" }}>
                            <Typography sx={{ fontWeight: 500, fontSize: 16, color: "#1D2939" }}>
                                {userName || "UserName"}
                            </Typography>
                            <Typography
                                noWrap
                                sx={{
                                    fontWeight: 400,
                                    fontSize: 14,
                                    color: userOverallDesignation.length > 0 ? "#0000EE" : "#98A2B3",
                                    maxWidth: "160px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    textDecoration: userOverallDesignation.length > 0 ? "underline" : "none",
                                }}
                            >
                                {designationName || ""}
                            </Typography>
                        </Box>
    
                        <Box onClick={handleLogout} sx={{ cursor: "pointer" }}>
                            <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="M4 15C4 15.93 4 16.395 4.10222 16.7765C4.37962 17.8117 5.18827 18.6204 6.22354 18.8978C6.60504 19 7.07003 19 8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H8C7.07003 1 6.60504 1 6.22354 1.10222C5.18827 1.37962 4.37962 2.18827 4.10222 3.22354C4 3.60504 4 4.07003 4 5M10 6L14 10M14 10L10 14M14 10H1"
                                stroke="#1D2939"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            </svg>
                        </Box>
    
                    </Box>
                </Box>
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

            {openUserDesignationDropdown && userOverallDesignation?.length > 0 && (
                <Dialog
                    open={openUserDesignationDropdown}
                    keepMounted
                    onClose={() => setOpenUserDesignationDropdown(false)}
                    aria-describedby="alert-dialog-slide-description"
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "24px",
                                        color: "#1D2939",
                                    }}
                                >
                                    Choose Designation
                                </Typography>
                            </Box>
                            <Box
                                p={1}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    background: "#EAECF0",
                                    borderRadius: "50%",
                                }}
                            >
                                <svg
                                    onClick={() => setOpenUserDesignationDropdown(false)}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.6666 5.33447L5.33325 14.6678M5.33325 5.33447L14.6666 14.6678"
                                        stroke="#667085"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Box>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {userOverallDesignation.map((designation) => (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 2,
                                    border: "1px solid #EAECF0",
                                    borderRadius: "5px",
                                    marginBottom: 2,
                                    cursor: "pointer",
                                }}

                                className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRole" : ""}`}

                                onClick={ async () => {
                                    if(designation?.division_id && designation?.designation_id){
                                        localStorage.setItem("designation_id", designation?.designation_id);
                                        localStorage.setItem("designation_name", designation?.designation?.designation_name);
                                        localStorage.setItem("division_id", designation?.division_id);
                                        localStorage.setItem("division_name", designation?.division?.division_name);
                                        setOpenUserDesignationDropdown(false);

                                        var selected_designation_id =localStorage.getItem("designation_id") || "0";
                                        var selected_designation_name = localStorage.getItem("designation_name") || "";
                                        var login_user_id = localStorage.getItem("user_id") || "0";
                                        setLoading(true);
                                        try {

                                            const serverURL = process.env.REACT_APP_SERVER_URL;
                                            const response = await fetch(`${serverURL}/auth/set_user_hierarchy`, {
                                                method: "POST",
                                                headers: {
                                                "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({ user_id: login_user_id, designation_id: selected_designation_id , designation_name: selected_designation_name }),
                                            });

                                            setLoading(false);

                                            const data = await response.json();
                                            if (!response.ok) {
                                                throw new Error(data.message);
                                            }

                                            const responseData = data.data;
        
                                            if (data && data.success && !responseData.getDataBasesOnUsers) {
                                                localStorage.setItem("allowedUserIds",JSON.stringify(responseData.allowedUserIds));
                                                localStorage.setItem("allowedDepartmentIds",JSON.stringify(responseData.allowedDepartmentIds));
                                                localStorage.setItem("allowedDivisionIds",JSON.stringify(responseData.allowedDivisionIds));
                                                localStorage.setItem("getDataBasesOnUsers",JSON.stringify(responseData.getDataBasesOnUsers));
                                            }else{
                                                localStorage.setItem("allowedUserIds",JSON.stringify(responseData.allowedUserIds));
                                                localStorage.setItem("getDataBasesOnUsers",JSON.stringify(responseData.getDataBasesOnUsers));
                                            }

                                            // if(JSON.parse(localStorage.getItem("user_id")) === 1){
                                            //     navigate("/dashboard");
                                            // }else{
                                                if (location.pathname === "/dashboard") {
                                                    navigate(0);
                                                } else {
                                                    navigate("/dashboard");
                                                }
                                            // }
                                
                                        } catch (err) {
                                            setLoading(false);
                                            console.log(err,"error");
                                        }
                                    }
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        style={{
                                            fontWeight: "600",
                                            fontSize: "18px",
                                            color: "#1D2939",
                                        }}
                                        className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRoleName" : ""}`}
                                    >
                                        {designation?.["designation"]?.designation_name}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        style={{
                                            fontWeight: "400",
                                            fontSize: "14px",
                                            color: "#667085",
                                        }}
                                        className={`${designation?.designation_id == localStorage.getItem('designation_id') ? "activeDesignationRoleDesc" : ""}`}
                                    >
                                        {designation?.["designation"]?.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </DialogContent>
                </Dialog>
            )}
            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}
        </Box>
    );
};

export default Dashboard;
