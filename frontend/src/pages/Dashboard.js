import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Menu, 
    MenuItem,
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
    IconButton,
    Button,
} from "@mui/material";
import { styled } from "@mui/system";
import LogoText from "../Images/cid_logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/navbar";
import api from "../services/api";
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

    const tabLabels = [
        { label: "UI Module", route: "/case/ui_case", key: "ui_case" },
        {   label: "Court Module", 
            route: "/case/pt_case", 
            key: "pt_case",
            options : [
                {label: "Trial Courts", route: "/case/pt_case", key: "pt_case", actionKey: "pt_trail_case"},
                {label: "Other Courts", route: "/case/pt_case", key: "pt_case", actionKey: "pt_other_case"},
            ]
        },
        { label: "Crime Intelligence", route: "/case/ui_case", key: "crime_intelligence" },
        { label: "Enquiries", route: "/case/enquiry", key: "eq_case" },
        { label: "Crime Analytics", route: "/iframe", key: "crime_analytics" },
        { 
            label: "Orders & Circulars", 
            route: "/repository/judgements", 
            key: "order_circulars",
            options : [
                {label: "Goverment Order", route: "/repository/gn_order", key: "gn_order"},
                {label: "Judgement", route: "/repository/judgements", key: "judgements"},
                {label: "Circular", route: "/repository/circular", key: "circular"},
            ]
        },
    ];

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

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const userId = localStorage.getItem("user_id");
    
    const location = useLocation();
    const [userOverallDesignation, setUserOverallDesignation] = useState(localStorage.getItem("userOverallDesignation") ? JSON.parse(localStorage.getItem("userOverallDesignation")) : []);
    const [openUserDesignationDropdown, setOpenUserDesignationDropdown] = useState(false);
    const userName = localStorage.getItem("username");
    const designationName = localStorage.getItem("designation_name");
    const [notificationCount, setNotificationCount] = useState(localStorage.getItem("unreadNotificationCount") || 0);
    
    const [loading, setLoading] = useState(false);
    const [dashboardMenu, setDashboardMenu] = useState({});

    const [activeTabKey, setActiveTabKey] = useState("ui_case");
    const selectedTab = useRef(tabLabels[0]);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const [submenuItems, setSubmenuItems] = useState([]);
    const [selectedSubKey, setSelectedSubKey] = useState("");

    const handleTabClick = (event, tab) => {

        if(tab.key === "crime_analytics"){
            localStorage.setItem("tabActiveKey", "crime_analytics");
            navigate(tab?.route);
            window.location.reload();
            return;
        }

        selectedTab.current = tab;
        if (tab.options) {
            setSubmenuAnchorEl(event.currentTarget);
            setSubmenuItems(tab.options);
        } else {
            setActiveTabKey(tab.key);
            setSelectedSubKey("");
        }
    };

    const handleMenuItemClick = (option) => {
        selectedTab.current = option;
        setSelectedSubKey(option.key);
        setActiveTabKey(option?.actionKey || option.key);
        setSubmenuAnchorEl(null);
    };

    const handleMenuClose = () => {
        setSubmenuAnchorEl(null);
    };
    
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

    const getAvatarColor = (days, dividerCount) => {
        
        if(dividerCount === 2 && days === 1){
            days = 2;
        }

        const dayValue = Number(days);

        if (dayValue === 0) {
            return "linear-gradient(135deg, #4caf50, #81c784)";
        } else if (dayValue === 1) {
            return "linear-gradient(135deg, #ffb300, #ffca28)";
        } else if (dayValue >= 2) {
            return "linear-gradient(135deg, #e53935, #ef5350)";
        } else {
            return "linear-gradient(135deg, #4caf50, #81c784)";
        }
    };

    useEffect(() => {
        if(activeTabKey){
            localStorage.setItem("tabActiveKey",activeTabKey);
            getDashboardTiles()
        }
    }, [activeTabKey]);

    const getDashboardTiles = async () => {
        const userDesignationId = localStorage.getItem('designation_id');
        const userDesignationName = localStorage.getItem('designation_name');
        const userRole = localStorage.getItem('role_title');
        const userRoleId = localStorage.getItem('role_id');
        var userDesignation = "";

        if(userRole == "Investigation officer" || userRoleId == 6){
            userDesignation = "IO"
        }else{
            if(userDesignationName.includes("DIG")){
                userDesignation = "DIG"
            }else if(userDesignationName.includes("ADG") || userDesignationName.includes("ADGP")){
                userDesignation = "ADGP"
            }else if(userDesignationName.includes("DGP")){
                userDesignation = "DGP"
            }
        }

        
        const payload = {
            user_designation_id: userDesignationId || null,
            user_designation : userDesignation ,
            case_modules: activeTabKey
        };

        setLoading(true);

        try {
            const response = await api.post("/auth/fetch_dash_count", payload);
            setLoading(false);

            if (response?.success) {
                if(response?.data){
                    setDashboardMenu(response.data);
                }else{
                    setDashboardMenu({});
                }
            } else {
                const errorMessage = response?.message || "Failed to fetch dashboard data. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error"
                });
                setDashboardMenu({});
            }
        } catch (error) {
            setLoading(false);
            const message = error?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error"
            });
            setDashboardMenu({});
        }
    }

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp); // no parseInt
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    };

    const getDashboardData = async ()=>{
        
        setLoading(true);
        try {
            const response = await api.post("/refresh_alert_cron");

            setLoading(false);

            if (response?.refreshedAt) {
                
                localStorage.setItem("refreshData", response?.refreshedAt);

            } else {
                const errorMessage = response?.message || "Failed to fetch dashboard data. Please try again.";
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: "toast-error"
                });
            }
        } catch (error) {
            setLoading(false);
            const message = error?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                className: "toast-error"
            });
        }
    }

    const navigateRouter = (details, divider, menuOption)=>{

        var router = selectedTab?.current?.route;

        var statePayload = {
            "dashboardName" : details?.label
        }

        if(divider?.record_id){
            statePayload["record_id"] = JSON.stringify(divider.record_id)
        }

        if(details?.actionKey){
            statePayload["actionKey"] = details?.actionKey
        }

        navigate(router, {state: statePayload})
    }

    const ViewAllCases = ()=>{
        var router = selectedTab?.current?.route;
        var statePayload = {};

        if(selectedTab?.current?.actionKey){
            statePayload["actionKey"] = selectedTab?.current?.actionKey
        }

        localStorage.setItem("tabActiveKey",selectedTab?.current?.key)
         
        navigate(router, {state: statePayload})
    }

    const storedTime = localStorage.getItem("refreshData");

    if (userId === "1") return null;
    return (
        <Box sx={{ bgcolor: "#e5e7eb", minHeight: "100vh" }}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
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

                    <Navbar unreadNotificationCount={notificationCount} />
                </Box>

                <Tabs
                    value={false}
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
                    {tabLabels.map((tab) => {
                        const isSelected = activeTabKey === tab.key || tab.options?.some(
                            (opt) => (opt?.actionKey ?? opt?.key) === activeTabKey
                        );

                        return (
                            <Tab
                                key={tab.key}
                                label={tab.label}
                                onClick={(e) => handleTabClick(e, tab)}
                                sx={{
                                    color: isSelected ? "#1976d2 !important" : "#1d2939",
                                    borderBottom: isSelected ? "2px solid #1976d2" : "none",
                                }}
                            />
                        );
                    })}
                </Tabs>

                <Menu
                    anchorEl={submenuAnchorEl}
                    open={Boolean(submenuAnchorEl)}
                    onClose={handleMenuClose}
                >
                    {submenuItems.map((option) => (
                        <MenuItem
                            key={option.key}
                            selected={selectedSubKey === option.key}
                            onClick={() => handleMenuItemClick(option)}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 2}}>
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 22, color: '#1D2939', my: 1 }}>
                        PENDENCY Alerts/Notifications of {selectedTab?.current?.label || ""}
                    </Typography>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'end', flexDirection: 'column', }}>
                    <Button
                        variant="outlined"
                        size="medium"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            borderRadius: 1,
                            color: '#fff',
                            border: 'none',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            px: 2.5,
                            mr: 1.5,
                            background: '#FF7043',
                            '&:hover': {
                                filter: 'brightness(1.1)',
                            }
                        }}
                        onClick={ViewAllCases}
                    >
                        View All Cases
                    </Button>
                </Box>
            </Box>

            <hr style={{borderWidth: 0.2, opacity: 0.4, margin: 0}} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',px: 4, py: 2}}>
                <Box
                    sx={{
                        backgroundColor: '#F0F4FF',
                        border: '1px solid #90CAF9',
                        borderRadius: 2,
                        padding: 1,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                    }}
                >
                    <InfoOutlinedIcon sx={{ color: '#1976d2' }} />
                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 400,
                                fontSize: 13,
                                color: '#344054',
                                mt: 0.5
                            }}
                        >
                            Please <strong style={{ color: '#1976d2' }}> click on statistics (numbers)</strong> in the below tiles to navigate to the particular {selectedTab?.current?.label || ""}.
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Typography sx={{ fontWeight: 400, color: '#009688', fontSize: '14px' }}>
                        Last Updated On: {storedTime ? formatDateTime(storedTime) : "Not Available"}
                    </Typography>
                    <Tooltip title="Refresh Dashboard" onClick={getDashboardData}>
                        <IconButton>
                            <RefreshIcon sx={{color: '#009688', fontWeight: 400}} />
                        </IconButton>
                    </Tooltip>
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
                {Object.entries(dashboardMenu).map(([key, value], index) => (
                <Card
                    key={key}
                    sx={{
                        width: 220,
                        height: 110,
                        borderRadius: 4,
                        padding: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: `linear-gradient(135deg, #2196F3, #673ab7b5)`,
                        color: '#fff',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                        }
                    }}
                >
                    {/* Top section with icon and title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.3)', pb: 1 }}>
                        <Box sx={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            padding: 1,
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DashboardIcon fontSize="medium" />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Tooltip title={value.label} arrow>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 'bold',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {value.label}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Divider section (optional details) */}
                    {value.divider_details && Object.keys(value.divider_details).length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1}}>
                            {Object.entries(value.divider_details).map(([dividerKey, dividerValue], idx) => (
                                <Box
                                    key={dividerKey}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigateRouter(value, dividerValue);
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        flex: 1,
                                        borderRadius: 2,
                                        padding: 1,
                                        textAlign: 'center',
                                        transition: 'background 0.2s',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            filter: 'brightness(1.1)',
                                        },
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            width: 30, 
                                            height: 30,
                                            borderRadius: "50%",
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600, 
                                            background: getAvatarColor(idx, Object.keys(value.divider_details).length) 
                                        }}
                                    >
                                        {dividerValue.count}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                        {dividerValue.name}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', mb: 2 }} onClick={()=>navigateRouter(value)}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {value.total_count}
                            </Typography>
                        </Box>
                    )}
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
