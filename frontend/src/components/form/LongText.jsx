import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Box, Tooltip, FormHelperText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'; // Material-UI Info Icon
import HistoryIcon from '@mui/icons-material/History'; // Material-UI History Icon
import './ShortText.css'
import textToSnakecase from './textformater';

const LongText = ({ field, formData, errors, onChange, onFocus, isFocused, onHistory }) => {
    return (
        <Box sx={{ width: '100%' }}>
            {field.heading && <h4 className={`form-field-heading ${field.disabled ? 'disabled' : ''}`}>{field.heading}</h4>}
            <TextField
                error={Boolean(errors?.[field?.name])}  // Use Boolean to convert error to true or false
                fullWidth
                id="outlined-basic"
                variant="outlined"
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
                name={field.name}
                // name={textToSnakecase(field.label)}
                value={formData && formData[field.name] || ''}
                // helperText={errors?.[field?.name] || field.supportingText || ' '}  // Display the error if it exists, else fallback to supportingText
                inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
                // required={field.required === true}
                disabled={field.disabled === true}
                onChange={(e) => onChange(e)}
                onFocus={onFocus}
                // focused={isFocused || false}
                multiline
                rows={8}
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
            <FormHelperText
            sx={{
                color: errors?.[field?.name]
                ? '#F04438 !important'
                : `${field?.supportingTextColor || ''} !important`,
            }}
            >
            {errors?.[field?.name] || field?.supportingText || ''}
            </FormHelperText>
        </Box>
    );
};

export default LongText;
