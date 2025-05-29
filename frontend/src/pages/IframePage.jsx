import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const IframePage = () => {
    const location = useLocation();

    const iframeSrc = location.state?.src || "https://app.powerbi.com/reportEmbed?reportId=d23e7528-61dc-497a-9634-ff6f4edcce7c&autoAuth=true&ctid=65106571-0237-463c-872f-93f62fdd586f";

    return (
        <Box p={2}>
            <iframe
                src={iframeSrc}
                title="Embedded"
                width="100%"
                height="600"
                style={{ border: "1px solid #ccc" }}
                allow="clipboard-write; encrypted-media; fullscreen; accelerometer; autoplay; camera; microphone; display-capture"
                allowFullScreen
            />
        </Box>
    );
};

export default IframePage;
