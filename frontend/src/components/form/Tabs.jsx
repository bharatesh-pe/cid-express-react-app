import React from "react";
import { Box, Checkbox, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

const TabsComponents = ({ field = {}, formData = {}, errors = {}, onChange, onFocus, isFocused, onHistory }) => {

    return (
        <Box sx={{width:'100%'}}>
            <Box sx={{ display: "flex", gap: "10px",flexWrap:'wrap' }}>
                {Array.isArray(field.options) && field.options.map((option, index) => (
                    <Box key={index} sx={{display: 'flex', alignItems: 'center'}}>
                        <Checkbox
                            name={field.id || ""}
                            id={option.code || ""}
                            value={option.code || ""}
                            disabled={field.disabled === true}
                            checked={formData[field.name] === option.code || false}
                            onChange={(e) =>
                                onChange(field.name, option.code, e.target.checked)
                            }
                            onFocus={onFocus}
                            focused={isFocused || false}
                        />
                        <label htmlFor={option.code || ""}>
                            {option.name || ""}
                        </label>
                    </Box>
                ))}
            </Box>
            {errors?.[field?.name] && (
                <div style={{ color: "#F04438" }}>{errors?.[field?.name]}</div>
            )}
        </Box>
    );
};

export default TabsComponents;
