import { Box } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const IframePage = () => {
    const location = useLocation();

    const iframeSrc = location.state?.src || "";

    return (
        <Box p={2}>
            <iframe
                src={iframeSrc}
                title="Embedded"
                width="100%"
                height="600"
                style={{ border: "1px solid #ccc" }}
            />
        </Box>
    );
};

export default IframePage;
