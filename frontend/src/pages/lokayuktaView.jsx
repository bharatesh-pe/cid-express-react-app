import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Typography } from "@mui/material";
import LokayuktaSidebar from "../components/lokayuktaSidebar";
import { West } from "@mui/icons-material";

const LokayuktaView = () => {

    const navigate = useNavigate();
    const { state } = useLocation();
    const { contentArray, headerDetails, backNavigation } = state || {};

    const [activeSidebar, setActiveSidebar] = useState(null);

    const [sidebarContentArray, setSidebarContentArray] = useState(contentArray ? JSON.parse(contentArray) : []);

    var userPermissions = JSON.parse(localStorage.getItem("user_permissions")) || [];

    const backToForm = ()=>{
        console.log(backNavigation,"backNavigation");

        if(backNavigation){
            navigate(backNavigation);
        }
    }

    const sidebarActive = (item)=>{
        setActiveSidebar(item);
    }

    console.log(userPermissions[0]?.case_details_print,"userPermissions[0]?.case_details_print");
    

    return (
        <Box sx={{ display: "flex" }}>

            <LokayuktaSidebar contentArray={sidebarContentArray} onClick={sidebarActive} activeSidebar={activeSidebar} />

            <Box width={'100%'}>

                {/* header content */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D0D5DD', height: '55.5px', padding: '3px 12px'}}>

                    <Typography
                        sx={{ fontSize: "19px", fontWeight: "500", color: "#171A1C", display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        className="Roboto"
                        onClick={backToForm}
                    >
                        <West />
                        {headerDetails || "Case Details"}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        {
                            userPermissions[0]?.case_details_download && 
                            <Button
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto GreenFillBtn"
                            >
                                Download
                            </Button>
                        }
                        {
                            userPermissions[0]?.case_details_print && 
                            <Button
                                sx={{
                                    background: "#0167F8",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    color: "#FFFFFF",
                                    padding: "6px 16px",
                                }}
                                className="Roboto GreenFillBtn"
                            >
                                Print
                            </Button>
                        }
                        <Button
                            sx={{
                                background: "#0167F8",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#FFFFFF",
                                padding: "6px 16px",
                            }}
                            className="Roboto blueButton"
                        >
                            Update Case
                        </Button>
                    </Box>

                </Box>

                {/* body content */}
                <Box p={2}>
                    
                </Box>

            </Box>
        </Box>
    );
};

export default LokayuktaView;
