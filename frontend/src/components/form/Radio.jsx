import React from "react";
import { Radio, Box, Tooltip } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';

const RadioBtn = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory, readOnly }) => {
    return (
        <Box sx={{display: 'block '}}>
            {(field.label || field.kannada) && (
                <h4 className={`form-field-heading ${readOnly || field.disabled ? 'disabled' : ''}`}>
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
                                    padding: '0px 0px 0px 3px', 
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
            <Box sx={{ display: "flex", gap: "10px", flexWrap: 'wrap' }}>
                {field.options?.map((option, index) => (
                    <Box key={`${field.id}-${option.code}`}>
                        <Radio
                            name={field.id} // Grouping radios by field ID
                            id={`${field.id}-${option.code}`} // Unique ID for each option
                            value={option.code} // Value for the radio button
                            checked={formData[field.name] === option.code} // Check state based on formData
                            onChange={() => onChange(field.name, option.code)} // Trigger change with field ID and selected value
                            disabled={readOnly || field.disabled === true}
                            onFocus={onFocus}
                            focused={isFocused || false}
                        />
                        <label htmlFor={`${field.id}-${option?.code}`}>
                            {option?.name}
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

export default RadioBtn;
