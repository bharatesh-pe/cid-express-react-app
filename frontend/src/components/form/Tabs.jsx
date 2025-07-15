import React from "react";
import { Box, Radio, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

const TabsComponents = ({ field = {}, formData = {}, errors = {}, onChange, onFocus, isFocused, onHistory, readOnly }) => {

    return (
        <Box sx={{width:'100%'}}>
            {(field.label || field.kannada) && (
                <h4 className="form-field-heading">
                    <div style={{ display: 'flex', alignItems: 'center',color: Boolean(errors?.[field?.name]) ? '#F04438' : '' }}>
                        <span>
                            {field.label}
                        </span>
                        <span className="anekKannada" style={{ marginTop: '6px' }}>
                            {field.kannada ? '/ ' + field.kannada + ' ' : ''}
                        </span>
                        {field.required && (
                            <span
                                style={{
                                    padding: '0px 0px 0px 5px', 
                                    verticalAlign: 'middle'
                                }} 
                                className='MuiFormLabel-asterisk MuiInputLabel-asterisk css-1ljffdk-MuiFormLabel-asterisk'
                            >
                                {'*'}
                            </span>
                        )}
                        {field.info && (
                            <Tooltip title={field.info ? field.info : ''} arrow placement="top">
                                <InfoIcon className='infoIcon' sx={{
                                    color: '#1570EF', 
                                    padding: '0px 0px 0px 3px;', 
                                    fontSize: '20px',
                                    verticalAlign: 'middle',
                                    marginBottom:'3px'
                                }}/>
                            </Tooltip>
                        )}
                        {field.history && (
                            <HistoryIcon 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onHistory) {
                                        onHistory();
                                    } else {
                                        console.log("clicked");
                                    }
                                }}
                                className='historyIcon' sx={{
                                color: '#1570EF', 
                                padding: '0 1px', 
                                fontSize: '20px',
                                verticalAlign: 'middle',
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                marginBottom:'3px'
                            }}/>
                        )}
                    </div>
                </h4>
            )}
            <Box sx={{ display: "flex", gap: "10px",flexWrap:'wrap' }}>
                {Array.isArray(field.options) && field.options.map((option, index) => (
                    <Box key={index} sx={{display: 'flex', alignItems: 'center'}}>
                        <Radio
                            name={`${field.name}-${index}`}
                            id={`${field.name}-${option.code}-${index}`}
                            value={option.code || ""}
                            disabled={readOnly || field.disabled === true}
                            checked={formData[field.name] === option.code || false}
                            onChange={(e) =>
                                onChange(field.name, option.code, e.target.checked)
                            }
                            onFocus={onFocus}
                            focused={isFocused || false}
                        />
                        <label htmlFor={`${field.name}-${option.code}-${index}`}>
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
