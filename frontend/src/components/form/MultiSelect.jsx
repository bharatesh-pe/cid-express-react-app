import React from "react";
import { TextField, Box, FormHelperText, Tooltip, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const MultiSelect = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory, disabled, readOnly, viewLinkedTemplate,hideLinkModule = false }) => {

    let multiSelectValue = [];

    const fieldValue = formData?.[field?.name];

    if (typeof fieldValue === 'string') {
        multiSelectValue = fieldValue.split(',');
    } else if (Array.isArray(fieldValue)) {
        multiSelectValue = fieldValue.map(String);
    } else if (typeof fieldValue === 'number') {
        multiSelectValue = [String(fieldValue)];
    } else {
        multiSelectValue = [];
    }

    return (
        <Box sx={{ width: '100%' }}>
            {field.heading && (
                <h4 className={`form-field-heading ${readOnly || field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>
            )}
            <Autocomplete
                className='bg-white'
                multiple
                limitTags={2}
                key={field.id}
                id={field.id}
                error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
                options={field.options}
                disabled={readOnly || disabled ||field.disabled === true}
                getOptionLabel={(option) => option.name}
                value={field.options.filter(option => multiSelectValue.includes(String(option.code)))}
                onChange={(event, newValue) => {
                    const selectedCodes = newValue ? newValue.map(item => item.code) : [];
                    onChange(field.name, selectedCodes);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        className='selectHideHistory'
                        label={
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
                        }
                        placeholder={field.placeholder} />
                )}
                onFocus={onFocus}
                focused={isFocused || false}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        // backgroundColor: '#fff', // Inner input background color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: isFocused ? '2px' : '1px', // Apply border width based on focus
                        borderColor: isFocused ? '#1570EF' : Boolean(errors?.[field?.name]) ? '#F04438' : '#D0D5DD', // Apply border color based on focus
                        boxShadow: isFocused ? '0px 0px 0px 3px #D1E9FF' : 'none', // Apply shadow based on focus
                    },
                }}
            />
            <FormHelperText sx={{ color: errors?.[field?.name] ? '#F04438' : '' }}>
                {errors?.[field?.name] || field?.supportingText || ''}
            </FormHelperText>
            {
                field?.linkModule && !hideLinkModule && (
                    <Tooltip title="" arrow placement="top">
                        <Box
                            onClick={()=> viewLinkedTemplate && viewLinkedTemplate(field)}
                            mt={1}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                color: 'primary.main',
                                fontSize: '0.875rem',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                            <Typography variant="body2" fontWeight={500}>
                                View Data Details
                            </Typography>
                        </Box>
                    </Tooltip>
                )
            }
        </Box>
    );
};

export default MultiSelect;