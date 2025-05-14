import React, { useState } from "react";
import { Box, CircularProgress, Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Tooltip, Typography } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

import userImg from "../Images/userImg.png";
import LogoText from "../Images/cid_logo.png";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const LokayuktaSidebar = ({contentArray, onClick, activeSidebar}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem("username");
    const designationName = localStorage.getItem("designation_name");

    const [loading, setLoading] = useState(false); // State for loading indicator

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

    const validSidebarItems = contentArray?.filter(item => !item?.field && item?.table) || [];

    return (
        <Box>
            <Box
                sx={{
                    display: { xs: "none", md: "block" },
                    width: "253px",
                    minWidth: "253px",
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

                        <Divider sx={{ marginTop: 1 }} />
                    </Box>

                    
                    {/* Sidebar Content (Navigation Links) */}

                    <Box sx={{ position: "relative" }}>
                        <List sx={{ padding: "4px", height: "100vh", overflow: "auto" }}>
                            <Box
                                py={0.5}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",
                                    paddingBottom: "150px",
                                }}
                            >
                                {
                                    validSidebarItems.length > 0 ? (
                                        validSidebarItems.map((element, index) => (
                                            <Tooltip title={element?.name} arrow placement="right" key={index}>
                                                <ListItem
                                                    sx={{ cursor: "pointer" }}
                                                    className={`sidebarMenus ${activeSidebar?.name === element.name ? "active" : ""}`}
                                                    onClick={() => onClick ? onClick(element) : console.log("sidebar selected")}
                                                >
                                                    <ListItemText primary={element?.name} />
                                                </ListItem>
                                            </Tooltip>
                                        ))
                                    ) : (
                                        <ListItem sx={{ cursor: "pointer", textAlign: 'center' }} className="sidebarMenus">
                                            <ListItemText primary="No Actions Found" />
                                        </ListItem>
                                    )
                                }

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
        </Box>
    );
};

export default LokayuktaSidebar;
