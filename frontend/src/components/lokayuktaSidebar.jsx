import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Collapse, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Tooltip, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

import userImg from "../Images/userImg.png";
import LogoText from "../Images/cid_logo.png";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeIcon from '@mui/icons-material/Home';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import Navbar from "./navbar";

const LokayuktaSidebar = ({ui_case_id, pt_case_id, contentArray, onClick, activeSidebar, templateName, fromCDR}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem("username");
    const designationName = localStorage.getItem("designation_name");

    const [loading, setLoading] = useState(false); // State for loading indicator
    const [openRegister, setOpenRegister] = useState(true);
    const [openInvestigation, setOpenInvestigation] = useState(fromCDR ? true : true);
    const [selectedInvestigationIndex, setSelectedInvestigationIndex] = useState(fromCDR ? 0 : null);

    const [notificationCount, setNotificationCount] = useState(localStorage.getItem("unreadNotificationCount") || 0);
    const [tableCounts, setTableCounts] = useState({});

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

    const validSidebarItems = contentArray?.filter(item => (!item?.field && item?.table) || item?.viewAction) || [];

    const registerItemArray = ["UI Case", "PT Case", "Enquiries"];

    const registerItem = validSidebarItems.find(item => registerItemArray.includes(item.name));
    const investigationItems = validSidebarItems.filter(item => !registerItemArray.includes(item.name));

    const cdrIndex = investigationItems.findIndex(item => item.name?.toLowerCase().includes("cdr"));

    useEffect(() => {
        const fetchCounts = async () => {
            if (!ui_case_id && !pt_case_id) return;
            const table_names = investigationItems.map(item => item.table).filter(Boolean);
            try {
                const serverURL = process.env.REACT_APP_SERVER_URL;
                const response = await fetch(`${serverURL}/templateData/getTableCountsByCaseId`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ table_names, ui_case_id, pt_case_id })
                });
                const data = await response.json();
                if (data.success) setTableCounts(data.data);
            } catch (err) {
                setTableCounts({});
            }
        };
        fetchCounts();
    }, [ui_case_id, pt_case_id]);

    return (
        <>
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    width: "280px",
                    minWidth: "280px",
                    overflow: "hidden",
                }}
            >
                <Paper sx={{ height: "100vh", borderRadius: "0", boxShadow: "none", borderRight: "1px solid #D0D5DD" }}>
                    {/* Sidebar Header */}
                    <Box
                        sx={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderBottom: "1px solid #D0D5DD",
                            height: "55.5px",
                            padding: "3px",
                        }}
                    >
                        <img
                            srcSet={`${LogoText}?w=150&fit=crop&auto=format&dpr=2 4x`}
                            src={`${LogoText}?w=150&fit=crop&auto=format`}
                            alt=""
                            style={{ width: "44px", height: "44px" }}
                            loading="lazy"
                        />

                        <p className="cidLogoText">
                            Case Management
                            <br />
                            System
                        </p>

                        <HomeIcon
                            sx={{ cursor: "pointer", color: "#1D2939", fontSize: '30px' }}
                            onClick={() => navigate("/dashboard")}
                        />
                        <Navbar unreadNotificationCount={notificationCount} />
                    </Box>

                    
                    {/* Sidebar Content (Navigation Links) */}
                    <Box sx={{ position: "relative" }}>
                        <List sx={{ padding: "4px", height: "100vh", overflow: "auto" }}>
                            <Box py={0.5} sx={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "150px" }}>

                                {/* Register Dropdown */}
                                {!fromCDR && (
                                    <Tooltip title={"Registration of a Crime"} arrow placement="right" key={"Registration of a Crime"}>   
                                        <ListItem sx={{background: '#1F1DAC', color: '#FFFFFF' ,mt: 1, borderRadius: '4px', cursor: 'pointer', overflow: 'hidden'}} onClick={() => setOpenRegister(!openRegister)}>
                                                <ListItemIcon sx={{ color: '#FFFFFF', minWidth: '35px' }}>
                                                    <DashboardCustomizeIcon />
                                                </ListItemIcon>
                                                <ListItemText className="sidebarTextEllipsis" primary="Registration of a Crime" />
                                                {openRegister ? <ExpandLess /> : <ExpandMore />}
                                        </ListItem>
                                    </Tooltip>
                                )}

                                {!fromCDR && (
                                    <Collapse in={openRegister} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding className="sidebarChildContainer">
                                            {registerItem ? (
                                                <Tooltip title={registerItem.name ? registerItem.name : "FIR"} arrow placement="right" key={registerItem.name ? registerItem.name : "FIR"}>
                                                    <ListItem
                                                        sx={{ cursor: "pointer", borderRadius: '4px' }}
                                                        className={`sidebarChildItem lokayuktaSidebarMenus menuColor_1 ${activeSidebar?.name === registerItem.name ? "active" : ""}`}
                                                        onClick={() => onClick ? onClick(registerItem) : console.log("sidebar selected")}
                                                    >
                                                    {registerItem?.icon && registerItem?.icon?.props && registerItem?.icon?.props.dangerouslySetInnerHTML ? (
                                                        <span
                                                            className="tableActionIcon"
                                                            dangerouslySetInnerHTML={{ __html: registerItem?.icon?.props.dangerouslySetInnerHTML?.__html }}
                                                        />
                                                    ) : (
                                                        <span className="tableActionIcon">
                                                            <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <circle cx="12" cy="12" r="12" fill="" />
                                                                <mask id="mask0_1120_40651" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                                                                    <rect x="4" y="4" width="16" height="16" fill="" />
                                                                </mask>
                                                                <g mask="url(#mask0_1120_40651)">
                                                                    <path d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z" fill="" />
                                                                </g>
                                                            </svg>
                                                        </span>
                                                    )}
                                                    <ListItemText primary={registerItem.name ? registerItem.name : "FIR"} />
                                                    </ListItem>
                                                </Tooltip>
                                            ) : (
                                                <ListItem sx={{ cursor: "pointer", textAlign: "center", pl: 4 }} className="lokayuktaSidebarMenus menuColor_1">
                                                    <ListItemText primary="No Actions Found" />
                                                </ListItem>
                                            )}
                                        </List>
                                    </Collapse>
                                )}

                                {/* Investigation Dropdown */}
                                <Tooltip title={"Investigations"} arrow placement="right" key={"Investigations"}>   
                                    <ListItem sx={{background: '#1F1DAC', color: '#FFFFFF' ,mt: 1, borderRadius: '4px', cursor: 'pointer', overflow: 'hidden'}} onClick={() => setOpenInvestigation(!openInvestigation)}>
                                            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: '35px' }}>
                                                <DashboardCustomizeIcon />
                                            </ListItemIcon>
                                            <ListItemText className="sidebarTextEllipsis" primary="Investigations" />
                                            {openInvestigation ? <ExpandLess /> : <ExpandMore />}
                                    </ListItem>
                                </Tooltip>

                                <Collapse in={openInvestigation} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding className="sidebarChildContainer">

                                        {investigationItems.length > 0 ? (
                                            investigationItems.map((element, index) => (
                                                <Tooltip title={element?.name} arrow placement="right" key={index}>
                                                    <ListItem
                                                        sx={{ cursor: "pointer", borderRadius: '4px' }}
                                                        className={`sidebarChildItem lokayuktaSidebarMenus menuColor_${index + 2} ${
                                                            (fromCDR && cdrIndex === index) ? "active" : (activeSidebar?.name === element.name ? "active" : "")
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedInvestigationIndex(index);
                                                            if (onClick) onClick(element);
                                                        }}
                                                    >
                                                        {element?.icon && element?.icon?.props && element?.icon?.props.dangerouslySetInnerHTML ? (
                                                            <span
                                                                className="tableActionIcon"
                                                                dangerouslySetInnerHTML={{ __html: element?.icon?.props.dangerouslySetInnerHTML?.__html }}
                                                            />
                                                        ) : (
                                                        <span className="tableActionIcon">
                                                            <svg width="50" height="50" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <circle cx="12" cy="12" r="12" fill="" />
                                                                <mask id="mask0_1120_40651" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
                                                                    <rect x="4" y="4" width="16" height="16" fill="" />
                                                                </mask>
                                                                <g mask="url(#mask0_1120_40651)">
                                                                    <path d="M7.80523 17.2667C7.51045 17.2667 7.25812 17.1618 7.04823 16.9519C6.83834 16.742 6.7334 16.4897 6.7334 16.1949V7.80523C6.7334 7.51045 6.83834 7.25812 7.04823 7.04823C7.25812 6.83834 7.51045 6.7334 7.80523 6.7334H16.1949C16.4897 6.7334 16.742 6.83834 16.9519 7.04823C17.1618 7.25812 17.2667 7.51045 17.2667 7.80523V13.3629L13.3629 17.2667H7.80523ZM13.2001 16.4001L16.4001 13.2001H13.2001V16.4001ZM9.0949 13.0206H12.0001V12.1539H9.0949V13.0206ZM9.0949 10.6334H14.9052V9.76673H9.0949V10.6334Z" fill="" />
                                                                </g>
                                                            </svg>
                                                        </span>
                                                        )}
                                                        <ListItemText
                                                        primary={
                                                            <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                                                            {element?.name}
                                                            {typeof tableCounts[element.table] === "number" && (
                                                                <Box
                                                                sx={{
                                                                    position: "absolute",
                                                                    right: 0,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    backgroundColor: activeSidebar?.name === element.name ? "#1F1DAC" : "#FFFFFF",
                                                                    color: activeSidebar?.name === element.name ? "#FFFFFF" : "#1F1DAC",
                                                                    border: activeSidebar?.name === element.name ? "1px solid #1F1DAC" : "1px solid #dfdfec",
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold",
                                                                    borderRadius: "50%",
                                                                    width: 20,
                                                                    height: 20,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                                >
                                                                {tableCounts[element.table]}
                                                                </Box>
                                                            )}
                                                            </Box>
                                                        }
                                                        />
                                                    </ListItem>
                                                </Tooltip>
                                            ))
                                        ) : (
                                            <ListItem sx={{ cursor: "pointer", textAlign: "center", pl: 4 }} className="lokayuktaSidebarMenus menuColor_2">
                                                <ListItemText primary="No Actions Found" />
                                            </ListItem>
                                        )}

                                    </List>
                                </Collapse>

                            </Box>
                            </List>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "end",
                                gap: "8px",
                                padding: "12px 10px",
                                position: "absolute",
                                bottom: "70px",
                                width: "92%",
                                borderTop: "1px solid #D0D5DD",
                                background: "#FFFFFF",
                            }}
                        >
                        <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", cursor: 'pointer' }}>
                                <Box
                                    sx={{
                                        width: "32px",
                                        height: "32px",
                                        border: "1px solid #D0D5DD",
                                        borderRadius: "50%",
                                    }}
                                >
                                    <img src={userImg} width="100%" height="100%" />
                                </Box>
                                <Box sx={{ display: "flex", flexDirection: "column" }}>
                                    <Typography
                                        align="left"
                                        sx={{
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            lineHeight: "18px",
                                            color: "#1D2939",
                                        }}
                                    >
                                        {userName ? userName : "UserName"}<br />
                                        <Typography
                                            noWrap
                                            sx={{
                                                fontWeight: 400,
                                                fontSize: "13px",
                                                lineHeight: "16px",
                                                color: "#98A2B3",
                                                maxWidth: "160px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {designationName ? designationName : ""}
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Typography
                            align="left"
                            sx={{
                                fontWeight: "400",
                                fontSize: "14px",
                                lineHeight: "18px",
                                color: "#98A2B3",
                            }}
                        >
                            <svg
                                style={{ cursor: "pointer" }}
                                onClick={handleLogout}
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
                        </Typography>
                    </Box>
                    </Box>
                </Paper>
            </Box>
            {loading && (
                <div className="parent_spinner" tabIndex="-1" aria-hidden="true">
                    <CircularProgress size={100} />
                </div>
            )}
        </>
    );
};

export default LokayuktaSidebar;
